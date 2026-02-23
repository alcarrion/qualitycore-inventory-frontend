// hooks/useCart.js
import { useState, useCallback, useRef } from "react";
import { ERRORS } from "../constants/messages";

/**
 * Hook personalizado para manejar la lógica del carrito de compras
 * Funciona tanto para entradas (compras) como salidas (ventas)
 */
export function useCart() {
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");

  // Ref para acceder al cart actual sin agregarlo como dependencia
  const cartRef = useRef(cart);
  cartRef.current = cart;

  /**
   * Agrega un producto al carrito o incrementa su cantidad si ya existe
   */
  const addToCart = useCallback((product, quantity, type, showError) => {
    if (!product || !quantity) {
      showError?.(ERRORS.SELECT_PRODUCT_AND_QUANTITY);
      return false;
    }

    const quantityNum = Number(quantity);

    if (isNaN(quantityNum) || quantityNum <= 0) {
      showError?.(ERRORS.QUANTITY_MUST_BE_POSITIVE);
      return false;
    }

    // Leer cart actual via ref (no necesita estar en deps)
    const currentCart = cartRef.current;
    const existingItem = currentCart.find((item) => item.product.id === product.id);
    const currentInCart = existingItem ? existingItem.quantity : 0;

    if (type === "output") {
      const availableStock = product.current_stock - currentInCart;
      if (quantityNum > availableStock) {
        showError?.(ERRORS.STOCK_INSUFFICIENT(availableStock, currentInCart));
        return false;
      }
    }

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantityNum;
      setCart(prevCart => prevCart.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } else {
      setCart(prevCart => [...prevCart, { product, quantity: quantityNum }]);
    }

    return true;
  }, []);

  /**
   * Elimina un producto del carrito
   */
  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter((item) => item.product.id !== productId));
  }, []);

  /**
   * Actualiza la cantidad de un producto en el carrito
   */
  const updateCartQuantity = useCallback((productId, newQuantity, type, showError) => {
    const quantity = Number(newQuantity);

    if (isNaN(quantity) || quantity <= 0) {
      showError?.(ERRORS.QUANTITY_MUST_BE_POSITIVE);
      return false;
    }

    const currentCart = cartRef.current;
    const item = currentCart.find(item => item.product.id === productId);
    if (!item) return false;

    if (type === "output") {
      const otherCartQuantity = currentCart
        .filter(i => i.product.id !== productId)
        .reduce((sum, i) => sum + i.quantity, 0);

      const availableStock = item.product.current_stock - otherCartQuantity;

      if (quantity > availableStock) {
        showError?.(ERRORS.STOCK_INSUFFICIENT(availableStock));
        return false;
      }
    }

    setCart(prevCart => prevCart.map((cartItem) =>
      cartItem.product.id === productId
        ? { ...cartItem, quantity }
        : cartItem
    ));

    return true;
  }, []);

  /**
   * Limpia el carrito y resetea selecciones
   */
  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomer("");
    setSelectedSupplier("");
  }, []);

  /**
   * Ajusta el carrito según disponibilidad real de stock.
   * Remueve productos sin stock y reduce cantidades excedentes.
   * @param {Array<{product_id: number, available: number}>} unavailable
   */
  const adjustCartStock = useCallback((unavailable) => {
    const unavailableMap = new Map(
      unavailable.map(u => [u.product_id, u.available])
    );
    setCart(prev => prev
      .filter(item => {
        const available = unavailableMap.get(item.product.id);
        return available === undefined || available > 0;
      })
      .map(item => {
        const available = unavailableMap.get(item.product.id);
        if (available !== undefined && item.quantity > available) {
          return { ...item, quantity: available };
        }
        return item;
      })
    );
  }, []);

  /**
   * Calcula el total del carrito
   */
  const calculateTotal = useCallback(() => {
    return cart.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }, [cart]);

  return {
    // Estado
    cart,
    selectedCustomer,
    selectedSupplier,

    // Setters
    setSelectedCustomer,
    setSelectedSupplier,

    // Acciones
    addToCart,
    removeFromCart,
    updateCartQuantity,
    adjustCartStock,
    clearCart,
    calculateTotal,
  };
}
