// hooks/useAdjustmentModal.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import type { WheelEvent } from "react";
import { postAdjustment } from "../services/api";
import { useApp } from "../contexts/AppContext";
import { useDataStore } from "../store/dataStore";
import type { Product } from "../types/models";

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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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

  const reset = useCallback((): void => {
    setProductSearch("");
    setShowDropdown(false);
    setSelectedProduct(null);
    setQuantity("");
    setReason("");
  }, []);

  const open = useCallback((): void => {
    reset();
    setShow(true);
  }, [reset]);

  const close = useCallback((): void => {
    setShow(false);
    reset();
  }, [reset]);

  const selectProduct = useCallback((product: Product): void => {
    setSelectedProduct(product);
    setProductSearch(`${product.name} (Stock: ${product.current_stock})`);
    setShowDropdown(false);
  }, []);

  const handleSubmit = useCallback(async (): Promise<void> => {
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
      const errData = resp.data as {
        detail?: string;
        reason?: string[];
        quantity?: string[];
        product?: string[];
      } | null;
      const errMsg = errData?.detail
        || errData?.reason?.[0]
        || errData?.quantity?.[0]
        || errData?.product?.[0]
        || "Error al registrar el ajuste de inventario.";
      showError(errMsg);
    }
  }, [selectedProduct, quantity, reason, fetchProducts, close, showSuccess, showError]);

  const handleWheel = useCallback((e: WheelEvent<HTMLInputElement>): void => {
    (e.target as HTMLInputElement).blur();
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
