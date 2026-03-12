// hooks/useTransactionCart.ts
// Agrupa el estado del carrito y la validación de cantidad al actualizar.
import { useCallback } from "react";
import { useApp } from "../contexts/AppContext";
import { useCart } from "./useCart";

export function useTransactionCart() {
  const { showError } = useApp();
  const {
    cart,
    selectedCustomer,
    selectedSupplier,
    setSelectedCustomer,
    setSelectedSupplier,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    adjustCartStock,
    calculateTotal,
  } = useCart();

  /**
   * Actualiza la cantidad de un item del carrito con validación.
   * Si newQuantity === 0, elimina el item.
   */
  const handleUpdateCartQuantity = useCallback(
    (productId: number, newQuantity: number, modalType: string): void => {
      if (isNaN(newQuantity) || newQuantity < 0) return;
      if (newQuantity === 0) {
        removeFromCart(productId);
        return;
      }
      updateCartQuantity(productId, newQuantity, modalType as "input" | "output", showError);
    },
    [removeFromCart, updateCartQuantity, showError]
  );

  return {
    cart,
    selectedCustomer,
    selectedSupplier,
    setSelectedCustomer,
    setSelectedSupplier,
    addToCart,
    removeFromCart,
    handleUpdateCartQuantity,
    clearCart,
    adjustCartStock,
    calculateTotal,
  };
}
