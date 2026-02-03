// hooks/useCart.js
import { useState, useCallback } from "react";

/**
 * Hook personalizado para manejar la lógica del carrito de compras
 * Funciona tanto para entradas (compras) como salidas (ventas)
 */
export function useCart() {
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");

  /**
   * Agrega un producto al carrito o incrementa su cantidad si ya existe
   * @param {Object} product - Producto a agregar
   * @param {number} quantity - Cantidad a agregar
   * @param {string} type - Tipo de movimiento ('input' o 'output')
   * @param {function} showError - Función para mostrar errores
   * @returns {boolean} - true si se agregó exitosamente, false si hubo error
   */
  const addToCart = useCallback((product, quantity, type, showError) => {
    if (!product || !quantity) {
      showError?.("Selecciona un producto y la cantidad.");
      return false;
    }

    const quantityNum = Number(quantity);

    // Validar que la cantidad sea un número positivo
    if (isNaN(quantityNum) || quantityNum <= 0) {
      showError?.("La cantidad debe ser un número mayor a 0.");
      return false;
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find((item) => item.product.id === product.id);
    const currentInCart = existingItem ? existingItem.quantity : 0;

    // Solo verificar stock en salidas (output), no en entradas (input)
    if (type === "output") {
      const availableStock = product.current_stock - currentInCart;

      // Verificar stock disponible (considerando lo que ya está en el carrito)
      if (quantityNum > availableStock) {
        showError?.(`Stock insuficiente. Disponible: ${availableStock} (${currentInCart} ya en carrito)`);
        return false;
      }
    }

    if (existingItem) {
      // Actualizar cantidad si ya existe
      const newQuantity = existingItem.quantity + quantityNum;
      setCart(prevCart => prevCart.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } else {
      // Agregar nuevo item al carrito
      setCart(prevCart => [...prevCart, { product, quantity: quantityNum }]);
    }

    return true;
  }, [cart]);

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
      showError?.("La cantidad debe ser un número mayor a 0.");
      return false;
    }

    const item = cart.find(item => item.product.id === productId);
    if (!item) return false;

    // Verificar stock para salidas
    if (type === "output") {
      // Calcular cuánto hay en el carrito sin contar este item
      const otherCartQuantity = cart
        .filter(i => i.product.id !== productId)
        .reduce((sum, i) => sum + i.quantity, 0);

      const availableStock = item.product.current_stock - otherCartQuantity;

      if (quantity > availableStock) {
        showError?.(`Stock insuficiente. Disponible: ${availableStock}`);
        return false;
      }
    }

    setCart(prevCart => prevCart.map((cartItem) =>
      cartItem.product.id === productId
        ? { ...cartItem, quantity }
        : cartItem
    ));

    return true;
  }, [cart]);

  /**
   * Limpia el carrito y resetea selecciones
   */
  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomer("");
    setSelectedSupplier("");
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
    clearCart,
    calculateTotal,
  };
}
