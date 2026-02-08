// src/components/Modal.js
import React, { useEffect } from "react";
import "../styles/components/Modal.css";

export default function Modal({ children, onClose, title, className = "" }) {
  // Cerrar con ESC y bloquear scroll del fondo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className={`modal-content ${className}`} onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
