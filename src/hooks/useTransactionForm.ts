// hooks/useTransactionForm.ts
// Agrupa el estado del formulario de transacción: modal, dropdowns y formData.
import { useState, useCallback } from "react";
import type { ChangeEvent, WheelEvent } from "react";
import { useTransactionModal } from "./useTransactionModal";
import { useTransactionDropdowns } from "./useTransactionDropdowns";
import type { TransactionFormData } from "./useTransactionDropdowns";
import type { CartItem } from "../types/ui";

interface TransactionFormParams {
  // customers, suppliers, products eliminados: los dropdowns buscan lazy via hooks
  // Callbacks del carrito — useTransactionDropdowns los necesita para limpiar
  // el cart cuando cambia el proveedor en modo "input".
  cart: CartItem[];
  cartClearCart: () => void;
  selectedSupplier: string | number;
  setSelectedCustomer: (value: string | number) => void;
  setSelectedSupplier: (value: string | number) => void;
}

export function useTransactionForm({
  cart, cartClearCart, selectedSupplier,
  setSelectedCustomer, setSelectedSupplier,
}: TransactionFormParams) {
  const modal = useTransactionModal();
  const [formData, setFormData] = useState<TransactionFormData>({ quantity: "", product: "", customer: "" });

  const dropdowns = useTransactionDropdowns({
    modalType: modal.type,
    selectedSupplier,
    cart,
    cartClearCart,
    setSelectedCustomer,
    setSelectedSupplier,
    showModal: modal.showModal,
    formData,
    setFormData,
  });

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

  const clearForm = useCallback((): void => {
    dropdowns.clearDropdowns();
    setFormData({ quantity: "", product: "", customer: "" });
  }, [dropdowns]);

  const openModal = useCallback((transactionType: string): void => {
    modal.setType(transactionType);
    dropdowns.clearDropdowns();
    setFormData({ quantity: "", product: "", customer: "" });
    modal.setShowModal(true);
  }, [modal, dropdowns]);

  return {
    modal,
    formData,
    setFormData,
    dropdowns,
    handleInputChange,
    handleWheel,
    clearForm,
    openModal,
  };
}
