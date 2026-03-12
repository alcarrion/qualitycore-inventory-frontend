// hooks/useTransactionActions.ts
// Orquestador delgado: compone useTransactionForm + useTransactionCart + useTransactionSubmit.
// Expone la misma API pública que antes (backward compatible con TransactionsPage).
import { useCallback, useMemo } from "react";
import type { ChangeEvent, WheelEvent } from "react";
import { useApp } from "../contexts/AppContext";
import { useTransactionCart } from "./useTransactionCart";
import { useTransactionForm } from "./useTransactionForm";
import { useTransactionSubmit } from "./useTransactionSubmit";
import { ERRORS } from "../constants/messages";
import type { DropdownController } from "../components/SearchableDropdown";
import type { Customer, Supplier, Product } from "../types/models";
import type { CartItem, ProductWithAvailability } from "../types/ui";
import type { TransactionFormData } from "./useTransactionDropdowns";

/**
 * Agrupa todos los datos y handlers del formulario de transacción en un
 * objeto estructurado. Se pasa como prop única a TransactionFormModal,
 * eliminando el prop drilling de 20+ props individuales.
 */
export interface TransactionFormContext {
  dropdowns: {
    supplier: DropdownController<Supplier>;
    customer: DropdownController<Customer>;
    product: DropdownController<ProductWithAvailability>;
  };
  contact: {
    selectedSupplier: string | number;
    selectedCustomer: string | number;
    onSupplierChange: (val: string | number) => void;
    onCustomerChange: (val: string | number) => void;
    onSelectSupplier: (item: Supplier) => void;
    onSelectCustomer: (item: Customer) => void;
  };
  product: {
    formData: TransactionFormData;
    onFormDataChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onWheel: (e: WheelEvent<HTMLInputElement>) => void;
    onSelectProduct: (item: Product) => void;
  };
  cart: {
    items: CartItem[];
    onAdd: () => void;
    onRemove: (productId: number) => void;
    onUpdateQuantity: (productId: number, qty: number) => void;
    totalPrice: number;
  };
  onSubmit: () => void;
}

export function useTransactionActions({ loadTransactions }: { loadTransactions: () => void }) {
  const { showError } = useApp();

  const cartHook = useTransactionCart();

  const form = useTransactionForm({
    cart: cartHook.cart,
    cartClearCart: cartHook.clearCart,
    selectedSupplier: cartHook.selectedSupplier,
    setSelectedCustomer: cartHook.setSelectedCustomer,
    setSelectedSupplier: cartHook.setSelectedSupplier,
  });

  // --- Operaciones cross-cutting (necesitan tanto form como cart) ---

  const clearAll = useCallback((): void => {
    cartHook.clearCart();
    form.clearForm();
  }, [cartHook, form]);

  const handleConfirmClose = useCallback((): void => {
    form.modal.setShowModal(false);
    form.modal.setShowConfirmClose(false);
    clearAll();
  }, [form.modal, clearAll]);

  const { handleSubmit, handleCorrection } = useTransactionSubmit({
    modalType: form.modal.type,
    selectedSupplier: cartHook.selectedSupplier,
    selectedCustomer: cartHook.selectedCustomer,
    cart: cartHook.cart,
    adjustCartStock: cartHook.adjustCartStock,
    handleConfirmClose,
    loadTransactions,
    modal: form.modal,
  });

  const handleAddToCart = useCallback((): void => {
    if (form.modal.type === "input" && !cartHook.selectedSupplier) {
      showError(ERRORS.SELECT_SUPPLIER_FIRST);
      return;
    }
    if (form.modal.type === "output" && !cartHook.selectedCustomer) {
      showError(ERRORS.SELECT_CUSTOMER_FIRST);
      return;
    }
    if (!form.formData.product || !form.formData.quantity) {
      showError(ERRORS.SELECT_PRODUCT_AND_QUANTITY);
      return;
    }

    // El producto seleccionado está en form.dropdowns.selectedProductObj
    // (establecido por selectProduct en useTransactionDropdowns)
    const selectedProduct = form.dropdowns.selectedProductObj;
    if (!selectedProduct) {
      showError(ERRORS.PRODUCT_NOT_FOUND);
      return;
    }

    const success = cartHook.addToCart(
      selectedProduct,
      form.formData.quantity,
      form.modal.type as "input" | "output",
      showError
    );
    if (success) {
      form.setFormData((prev) => ({ ...prev, product: "", quantity: "" }));
      form.dropdowns.productDropdown.clear();
    }
  }, [form, cartHook, showError]);

  // Memoizar el total del carrito para que no se recalcule en cada render del
  // hook, sino solo cuando el carrito cambia (calculateTotal depende de [cart]).
  const cartTotal = useMemo(
    () => cartHook.calculateTotal(),
    [cartHook.calculateTotal]
  );

  // Objeto estructurado que reemplaza los 20+ props individuales al modal.
  // Definido al final para que handleAddToCart y handleSubmit estén disponibles.
  const formContext: TransactionFormContext = {
    dropdowns: {
      supplier: form.dropdowns.supplierDropdown,
      customer: form.dropdowns.customerDropdown,
      product: form.dropdowns.productDropdown,
    },
    contact: {
      selectedSupplier: cartHook.selectedSupplier,
      selectedCustomer: cartHook.selectedCustomer,
      onSupplierChange: form.dropdowns.handleSupplierChange,
      onCustomerChange: cartHook.setSelectedCustomer,
      onSelectSupplier: form.dropdowns.selectSupplier,
      onSelectCustomer: form.dropdowns.selectCustomer,
    },
    product: {
      formData: form.formData,
      onFormDataChange: form.handleInputChange,
      onWheel: form.handleWheel,
      onSelectProduct: form.dropdowns.selectProduct,
    },
    cart: {
      items: cartHook.cart,
      onAdd: handleAddToCart,
      onRemove: cartHook.removeFromCart,
      onUpdateQuantity: (productId: number, qty: number) =>
        cartHook.handleUpdateCartQuantity(productId, qty, form.modal.type),
      totalPrice: cartTotal,
    },
    onSubmit: handleSubmit,
  };

  return {
    modal: form.modal,
    openModal: form.openModal,
    handleConfirmClose,
    formContext,
    // Las props individuales se mantienen para otros consumidores (ej. InvoiceModal, ConfirmDialog)
    selectedCustomer: cartHook.selectedCustomer,
    setSelectedCustomer: cartHook.setSelectedCustomer,
    handleSubmit,
    handleCorrection,
  };
}
