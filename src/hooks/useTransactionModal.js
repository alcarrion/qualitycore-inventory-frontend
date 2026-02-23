// hooks/useTransactionModal.js
import { useState, useEffect, useCallback } from "react";

/**
 * Hook para manejar el estado de modales de transacción:
 * modal de formulario (venta/compra), diálogo de confirmación,
 * reloj en tiempo real, y modales de facturas.
 *
 * @returns {{ showModal, setShowModal, type, setType, currentTime, showConfirmClose, ... }}
 */
export function useTransactionModal() {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [type, setType] = useState("input");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Invoice modals
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // Reloj del modal
  useEffect(() => {
    let interval;
    if (showModal) {
      interval = setInterval(() => setCurrentTime(new Date()), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [showModal]);

  const handleCloseModalAttempt = useCallback(() => {
    setShowConfirmClose(true);
  }, []);

  const handleCancelClose = useCallback(() => {
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
