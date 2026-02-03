// src/components/Toast.js
import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import "../styles/components/Toast.css";

/**
 * Componente de notificación Toast
 *
 * @param {string} type - Tipo: "success", "error", "warning", "info"
 * @param {string} message - Mensaje a mostrar
 * @param {function} onClose - Callback para cerrar el toast
 * @param {number} duration - Duración en ms (default: 5000)
 */
export default function Toast({ type = "info", message, onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{icons[type]}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>
        <X size={18} />
      </button>
    </div>
  );
}
