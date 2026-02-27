// hooks/useTransactionDropdowns.ts
import { useEffect, useCallback, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useDropdownSearch } from "./useDropdownSearch";
import type { Product, Customer, Supplier } from "../types/models";
import type { CartItem } from "../types/ui";

type ProductWithStock = Product & { availableStock?: number };

export interface TransactionFormData {
  quantity: string;
  product: string | number;
  customer: string;
}

interface TransactionDropdownsProps {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  modalType: string;
  selectedSupplier: string | number;
  cart: CartItem[];
  cartClearCart: () => void;
  setSelectedCustomer: (value: string | number) => void;
  setSelectedSupplier: (value: string | number) => void;
  showModal: boolean;
  formData: TransactionFormData;
  setFormData: Dispatch<SetStateAction<TransactionFormData>>;
}

/**
 * Hook para manejar la configuración y selección de dropdowns
 * de cliente, proveedor y producto en transacciones.
 */
export function useTransactionDropdowns({
  products, customers, suppliers,
  modalType, selectedSupplier, cart,
  cartClearCart, setSelectedCustomer, setSelectedSupplier,
  showModal, formData, setFormData,
}: TransactionDropdownsProps) {
  const customerDropdown = useDropdownSearch<Customer>(customers);
  const supplierDropdown = useDropdownSearch<Supplier>(suppliers);

  const productItems = useMemo((): ProductWithStock[] => {
    let items: ProductWithStock[] = products;
    if (modalType === "input" && selectedSupplier) {
      items = items.filter((p) => p.supplier === Number(selectedSupplier));
    }
    if (modalType === "output") {
      items = items.map((p) => {
        const cartItem = cart.find((item) => item.product.id === p.id);
        const availableStock = cartItem ? p.current_stock - cartItem.quantity : p.current_stock;
        return { ...p, availableStock };
      });
    }
    return items;
  }, [products, modalType, selectedSupplier, cart]);

  const productDropdown = useDropdownSearch<ProductWithStock>(productItems);

  const closeAllDropdowns = useCallback(() => {
    customerDropdown.setIsOpen(false);
    supplierDropdown.setIsOpen(false);
    productDropdown.setIsOpen(false);
  }, [customerDropdown, supplierDropdown, productDropdown]);

  // Click outside cierra dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.formGroup')) closeAllDropdowns();
    };
    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModal, closeAllDropdowns]);

  // --- Select handlers ---
  const selectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer.id);
    customerDropdown.select(customer.name);
  }, [setSelectedCustomer, customerDropdown]);

  const handleSupplierChange = useCallback((newSupplierId: string | number) => {
    if (cart.length > 0 && selectedSupplier && selectedSupplier !== newSupplierId) {
      cartClearCart();
      productDropdown.clear();
      setFormData((prev) => ({ ...prev, product: "", quantity: "" }));
    }
    setSelectedSupplier(newSupplierId);
  }, [cart.length, selectedSupplier, cartClearCart, setSelectedSupplier, productDropdown, setFormData]);

  const selectSupplier = useCallback((supplier: Supplier) => {
    handleSupplierChange(supplier.id);
    supplierDropdown.select(supplier.name);
  }, [handleSupplierChange, supplierDropdown]);

  const selectProduct = useCallback((product: ProductWithStock) => {
    setFormData((prev) => ({ ...prev, product: product.id }));
    const displayStock = product.availableStock ?? product.current_stock;
    productDropdown.select(`${product.name} (Stock: ${displayStock})`);
    customerDropdown.setIsOpen(false);
    supplierDropdown.setIsOpen(false);
  }, [productDropdown, customerDropdown, supplierDropdown, setFormData]);

  const clearDropdowns = useCallback(() => {
    customerDropdown.clear();
    supplierDropdown.clear();
    productDropdown.clear();
  }, [customerDropdown, supplierDropdown, productDropdown]);

  return {
    customerDropdown,
    supplierDropdown,
    productDropdown,
    selectCustomer,
    selectSupplier,
    selectProduct,
    handleSupplierChange,
    clearDropdowns,
  };
}
