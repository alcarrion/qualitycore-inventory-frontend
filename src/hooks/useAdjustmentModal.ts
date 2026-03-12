// hooks/useAdjustmentModal.ts
import { useState, useEffect, useCallback } from "react";
import type { WheelEvent } from "react";
import { postAdjustment } from "../services/api";
import { useApp } from "../contexts/AppContext";
import { useProductSearch } from "./useProductSearch";
import { useLazyDropdown } from "./useLazyDropdown";
import type { Product } from "../types/models";

/**
 * Hook que encapsula toda la lógica del modal de ajuste de inventario:
 * - Estado del formulario (producto, cantidad, motivo)
 * - Reloj (solo activo cuando el modal está abierto)
 * - Búsqueda/selección de producto (lazy, server-side via useProductSearch + useLazyDropdown)
 * - Submit con validación
 */
export function useAdjustmentModal() {
  const { showSuccess, showError } = useApp();

  const [show, setShow] = useState(false);
  const [productSearchText, setProductSearchText] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Búsqueda lazy: llama al API con el texto que escribe el usuario (300ms debounce)
  const { products: filteredProducts } = useProductSearch(productSearchText);

  // useLazyDropdown: conecta la búsqueda server-side con la UI (highlight + teclado)
  const { dropdown: productDropdown, confirmSelection: confirmProductSelection, clear: clearProductDropdown } =
    useLazyDropdown<Product>(filteredProducts, setProductSearchText, {
      onConfirm: (product) => setSelectedProduct(product),
      onAfterClear: () => setSelectedProduct(null),
    });

  // Reloj solo activo cuando el modal está abierto
  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [show]);

  const reset = useCallback((): void => {
    clearProductDropdown();
    setQuantity("");
    setReason("");
  }, [clearProductDropdown]);

  const open = useCallback((): void => {
    reset();
    setShow(true);
  }, [reset]);

  const close = useCallback((): void => {
    setShow(false);
    reset();
  }, [reset]);

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
      // Disparar evento para que InventoryPage refresque su lista server-side
      window.dispatchEvent(new Event("recargarInventario"));
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
  }, [selectedProduct, quantity, reason, close, showSuccess, showError]);

  const handleWheel = useCallback((e: WheelEvent<HTMLInputElement>): void => {
    (e.target as HTMLInputElement).blur();
  }, []);

  return {
    show,
    open,
    close,
    currentTime,
    productDropdown,
    confirmProductSelection,
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
