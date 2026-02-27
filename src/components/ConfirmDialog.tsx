// src/components/ConfirmDialog.tsx
import React from "react";
import { X, AlertTriangle, AlertCircle, Info } from "lucide-react";
import "../styles/components/ConfirmDialog.css";

type DialogType = "danger" | "warning" | "info";

const TYPE_ICONS: Record<DialogType, React.ElementType> = {
  danger: AlertTriangle,
  warning: AlertCircle,
  info: Info,
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message = "¿Estás seguro de que deseas continuar?",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  type = "danger",
}: Props) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const IconComponent = TYPE_ICONS[type] ?? AlertTriangle;

  return (
    <div className="confirm-dialog-overlay" onClick={onClose}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-header">
          <div className={`confirm-dialog-icon confirm-dialog-icon-${type}`}>
            <IconComponent size={24} />
          </div>
          <button className="confirm-dialog-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="confirm-dialog-content">
          <h3 className="confirm-dialog-title">{title}</h3>
          <p className="confirm-dialog-message">{message}</p>
        </div>

        <div className="confirm-dialog-actions">
          <button className="confirm-dialog-button confirm-dialog-button-cancel" onClick={onClose}>
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
