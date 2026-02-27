// hooks/useTransactionActions.ts
import { useState, useCallback } from "react";
import type { ChangeEvent, WheelEvent } from "react";
import { useDataStore } from "../store/dataStore";
import { useApp } from "../contexts/AppContext";
import { useCart } from "./useCart";
import { useTransactionModal } from "./useTransactionModal";
import { useTransactionDropdowns } from "./useTransactionDropdowns";
import type { TransactionFormData } from "./useTransactionDropdowns";
import { useTransactionSubmit } from "./useTransactionSubmit";
import { ERRORS } from "../constants/messages";

/**
 * Hook orquestador para transacciones.
 * Conecta cart, modal, dropdowns y submit.
 */
export function useTransactionActions({ loadTransactions }: { loadTransactions: () => void }) {
  const { showError } = useApp();

  const products = useDataStore(state => state.products);
  const customers = useDataStore(state => state.customers);
  const suppliers = useDataStore(state => state.suppliers);

  const {
    cart, selectedCustomer, selectedSupplier,
    setSelectedCustomer, setSelectedSupplier,
    addToCart: cartAddToCart,
    removeFromCart: cartRemoveFromCart,
    updateCartQuantity: cartUpdateQuantity,
    clearCart: cartClearCart,
    adjustCartStock, calculateTotal,
  } = useCart();

  const modal = useTransactionModal();

  const [formData, setFormData] = useState<TransactionFormData>({ quantity: "", product: "", customer: "" });

  const dropdowns = useTransactionDropdowns({
    products, customers, suppliers,
    modalType: modal.type, selectedSupplier, cart,
    cartClearCart, setSelectedCustomer, setSelectedSupplier,
    showModal: modal.showModal, formData, setFormData,
  });

  // --- Clear all ---
  const clearAll = useCallback(() => {
    cartClearCart();
    dropdowns.clearDropdowns();
    setFormData({ quantity: "", product: "", customer: "" });
  }, [cartClearCart, dropdowns]);

  // --- Modal open/close ---
  const openModal = useCallback((transactionType: string) => {
    modal.setType(transactionType);
    clearAll();
    modal.setShowModal(true);
  }, [modal, clearAll]);

  const handleConfirmClose = useCallback(() => {
    modal.setShowModal(false);
    modal.setShowConfirmClose(false);
    clearAll();
  }, [modal, clearAll]);

  // --- Submit & Correction ---
  const { handleSubmit, handleCorrection } = useTransactionSubmit({
    modalType: modal.type, selectedSupplier, selectedCustomer,
    cart, adjustCartStock, handleConfirmClose,
    loadTransactions, modal,
  });

  // --- Form handlers ---
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    if (name === "quantity") {
      const numValue = Number(value);
      if (value === "" || (numValue > 0 && !isNaN(numValue))) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleWheel = useCallback((e: WheelEvent<HTMLInputElement>): void => {
    (e.target as HTMLInputElement).blur();
  }, []);

  // --- Cart wrappers ---
  const handleAddToCart = useCallback(() => {
    if (modal.type === "input" && !selectedSupplier) {
      showError(ERRORS.SELECT_SUPPLIER_FIRST);
      return;
    }
    if (modal.type === "output" && !selectedCustomer) {
      showError(ERRORS.SELECT_CUSTOMER_FIRST);
      return;
    }
    if (!formData.product || !formData.quantity) {
      showError(ERRORS.SELECT_PRODUCT_AND_QUANTITY);
      return;
    }

    const selectedProduct = products.find((p) => p.id === Number(formData.product));
    if (!selectedProduct) {
      showError(ERRORS.PRODUCT_NOT_FOUND);
      return;
    }

    const success = cartAddToCart(selectedProduct, formData.quantity, modal.type as 'input' | 'output', showError);
    if (success) {
      setFormData((prev) => ({ ...prev, product: "", quantity: "" }));
      dropdowns.productDropdown.clear();
    }
  }, [modal.type, selectedSupplier, selectedCustomer, formData, products, cartAddToCart, showError, dropdowns]);

  const handleUpdateCartQuantity = useCallback((productId: number, newQuantity: number) => {
    if (isNaN(newQuantity) || newQuantity < 0) return;
    if (newQuantity === 0) {
      cartRemoveFromCart(productId);
      return;
    }
    cartUpdateQuantity(productId, newQuantity, modal.type as 'input' | 'output', showError);
  }, [cartRemoveFromCart, cartUpdateQuantity, modal.type, showError]);

  return {
    modal, openModal, handleConfirmClose,
    customerDropdown: dropdowns.customerDropdown,
    supplierDropdown: dropdowns.supplierDropdown,
    productDropdown: dropdowns.productDropdown,
    selectedCustomer, setSelectedCustomer, selectCustomer: dropdowns.selectCustomer,
    selectedSupplier, handleSupplierChange: dropdowns.handleSupplierChange, selectSupplier: dropdowns.selectSupplier,
    selectProduct: dropdowns.selectProduct,
    formData, handleInputChange, handleWheel,
    cart, handleAddToCart, cartRemoveFromCart, handleUpdateCartQuantity, calculateTotal,
    handleSubmit, handleCorrection,
  };
}
