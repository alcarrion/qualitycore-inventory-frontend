// hooks/useTransactionModal.ts
import { useState, useEffect, useCallback } from "react";
import type { Sale, Purchase } from "../types/models";

/**
 * Hook para manejar el estado de modales de transacción:
 * modal de formulario (venta/compra), diálogo de confirmación,
 * reloj en tiempo real, y modales de facturas.
 */
export function useTransactionModal() {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [type, setType] = useState("input");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Invoice modals
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  // Reloj del modal
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (showModal) {
      interval = setInterval(() => setCurrentTime(new Date()), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [showModal]);

  const handleCloseModalAttempt = useCallback((): void => {
    setShowConfirmClose(true);
  }, []);

  const handleCancelClose = useCallback((): void => {
    setShowConfirmClose(false);
  }, []);

  return {
    showModal,
    setShowModal,
    type,
    setType,
    currentTime,
    showConfirmClose,
    setShowConfirmClose,
    selectedSale,
    setSelectedSale,
    selectedPurchase,
    setSelectedPurchase,
    handleCloseModalAttempt,
    handleCancelClose,
  };
}
