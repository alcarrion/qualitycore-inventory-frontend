// src/components/ToastContainer.js
import React from "react";
import Toast from "./Toast";
import "../styles/components/ToastContainer.css";

/**
 * Contenedor para múltiples toasts
 * Se renderiza en App.js y gestiona todos los toasts activos
 */
export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
