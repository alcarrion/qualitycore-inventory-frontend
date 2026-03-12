// hooks/useProductDropdown.ts
// Gestiona el dropdown de Producto en transacciones: búsqueda lazy + enriquecimiento de stock disponible.
// El stock disponible descuenta los items ya en el carrito (para salidas).
import { useState, useMemo, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useLazyDropdown } from "./useLazyDropdown";
import { useProductSearch } from "./useProductSearch";
import type { Product } from "../types/models";
import type { CartItem, ProductWithAvailability } from "../types/ui";
import type { TransactionFormData } from "./useTransactionDropdowns";

interface ProductDropdownProps {
  modalType: string;
  selectedSupplier: string | number;
  cart: CartItem[];
  setFormData: Dispatch<SetStateAction<TransactionFormData>>;
}

export function useProductDropdown({
  modalType,
  selectedSupplier,
  cart,
  setFormData,
}: ProductDropdownProps) {
  const [productSearchText, setProductSearchText] = useState("");
  const [selectedProductObj, setSelectedProductObj] = useState<ProductWithAvailability | null>(null);

  // Para compras (input) filtra por proveedor; para ventas no aplica filtro
  const supplierFilter = modalType === "input" && selectedSupplier ? selectedSupplier : undefined;
  const { products: serverProducts } = useProductSearch(productSearchText, supplierFilter);

  // En modo venta: muestra stock disponible descontando lo que ya hay en el carrito
  const productItems = useMemo((): ProductWithAvailability[] => {
    if (modalType === "output") {
      return serverProducts.map((p) => {
        const cartItem = cart.find((item) => item.product.id === p.id);
        const availableStock = cartItem ? p.current_stock - cartItem.quantity : p.current_stock;
        return { ...p, availableStock };
      });
    }
    return serverProducts;
  }, [serverProducts, modalType, cart]);

  const {
    dropdown: productDropdown,
    confirmSelection: confirmProductSelection,
    clear: clearProduct,
  } = useLazyDropdown<ProductWithAvailability>(productItems, setProductSearchText, {
    onConfirm: (product) => {
      setSelectedProductObj(product);
      setFormData((prev) => ({ ...prev, product: product.id }));
    },
    onAfterClear: () => {
      setSelectedProductObj(null);
      setFormData((prev) => ({ ...prev, product: "", quantity: "" }));
    },
  });

  const selectProduct = useCallback(
    (product: ProductWithAvailability, closeOtherDropdowns: () => void) => {
      const displayStock = product.availableStock ?? product.current_stock;
      confirmProductSelection(product, `${product.name} (Stock: ${displayStock})`);
      closeOtherDropdowns();
    },
    [confirmProductSelection]
  );

  return {
    productDropdown,
    selectedProductObj,
    selectProduct,
    clearProduct,
  };
}
