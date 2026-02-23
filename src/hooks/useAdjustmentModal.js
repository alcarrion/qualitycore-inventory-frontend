// hooks/useAdjustmentModal.js
import { useState, useEffect, useMemo, useCallback } from "react";
import { postAdjustment } from "../services/api";
import { useApp } from "../contexts/AppContext";
import { useDataStore } from "../store/dataStore";

/**
 * Hook que encapsula toda la lógica del modal de ajuste de inventario:
 * - Estado del formulario (producto, cantidad, motivo)
 * - Reloj (solo activo cuando el modal está abierto)
 * - Búsqueda/selección de producto
 * - Submit con validación
 */
export function useAdjustmentModal() {
  const { showSuccess, showError } = useApp();
  const products = useDataStore(state => state.products);
  const fetchProducts = useDataStore(state => state.fetchProducts);

  const [show, setShow] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Reloj solo activo cuando el modal está abierto
  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [show]);

  const filteredProducts = useMemo(
    () => products
      .filter(p => !p.deleted_at)
      .filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.code && String(p.code).includes(productSearch))
      ),
    [products, productSearch]
  );

  const reset = useCallback(() => {
    setProductSearch("");
    setShowDropdown(false);
    setSelectedProduct(null);
    setQuantity("");
    setReason("");
  }, []);

  const open = useCallback(() => {
    reset();
    setShow(true);
  }, [reset]);

  const close = useCallback(() => {
    setShow(false);
    reset();
  }, [reset]);

  const selectProduct = useCallback((product) => {
    setSelectedProduct(product);
    setProductSearch(`${product.name} (Stock: ${product.current_stock})`);
    setShowDropdown(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedProduct) {
      showError("Selecciona un producto.");
      return;
    }
    const qty = Number(quantity);
    if (qty === 0 || isNaN(qty)) {
      showError("La cantidad del ajuste no puede ser cero.");
      return;
    }
    if (!reason.trim()) {
      showError("El motivo del ajuste es obligatorio.");
      return;
    }

    setIsSubmitting(true);
    const resp = await postAdjustment({
      product: selectedProduct.id,
      quantity: qty,
      reason: reason.trim(),
    });
    setIsSubmitting(false);

    if (resp.ok) {
      fetchProducts();
      close();
      showSuccess("Ajuste de inventario registrado correctamente.");
    } else {
      const errMsg = resp.data?.detail
        || resp.data?.reason?.[0]
        || resp.data?.quantity?.[0]
        || resp.data?.product?.[0]
        || "Error al registrar el ajuste de inventario.";
      showError(errMsg);
    }
  }, [selectedProduct, quantity, reason, fetchProducts, close, showSuccess, showError]);

  const handleWheel = useCallback((e) => {
    e.target.blur();
  }, []);

  return {
    show,
    open,
    close,
    currentTime,
    productSearch,
    setProductSearch,
    showDropdown,
    setShowDropdown,
    selectProduct,
    filteredProducts,
    selectedProduct,
    quantity,
    setQuantity,
    reason,
    setReason,
    handleWheel,
    handleSubmit,
    isSubmitting,
  };
}
