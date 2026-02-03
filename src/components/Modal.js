// src/components/Modal.js
import React from "react";
import "../styles/components/Modal.css";

export default function Modal({ children, onClose, title, className = "" }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
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
