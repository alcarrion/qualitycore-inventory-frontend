// src/components/ConfirmDialog.js
import React from "react";
import { X, AlertTriangle } from "lucide-react";
import "../styles/components/ConfirmDialog.css";

/**
 * Componente reutilizable para modales de confirmación
 *
 * @param {boolean} isOpen - Si el modal está visible
 * @param {function} onClose - Callback para cerrar el modal
 * @param {function} onConfirm - Callback cuando se confirma la acción
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje a mostrar
 * @param {string} confirmText - Texto del botón de confirmación (default: "Eliminar")
 * @param {string} cancelText - Texto del botón de cancelación (default: "Cancelar")
 * @param {string} type - Tipo de confirmación: "danger" | "warning" | "info" (default: "danger")
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message = "¿Estás seguro de que deseas continuar?",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  type = "danger",
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="confirm-dialog-overlay" onClick={onClose}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="confirm-dialog-header">
          <div className={`confirm-dialog-icon confirm-dialog-icon-${type}`}>
            <AlertTriangle size={24} />
          </div>
          <button className="confirm-dialog-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="confirm-dialog-content">
          <h3 className="confirm-dialog-title">{title}</h3>
          <p className="confirm-dialog-message">{message}</p>
        </div>

        {/* Actions */}
        <div className="confirm-dialog-actions">
          <button
            className="confirm-dialog-button confirm-dialog-button-cancel"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className={`confirm-dialog-button confirm-dialog-button-confirm confirm-dialog-button-${type}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
