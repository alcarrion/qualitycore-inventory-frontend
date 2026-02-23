// src/components/Modal.js
import React, { useEffect, useRef, useCallback } from "react";
import "../styles/components/Modal.css";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ children, onClose, title, className = "" }) {
  const modalRef = useRef(null);

  // Ref estable para onClose (evita re-ejecutar effects al cambiar referencia)
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Focus trap: mantener Tab/Shift+Tab dentro del modal
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      onCloseRef.current();
      return;
    }

    if (e.key !== "Tab") return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(FOCUSABLE_SELECTOR);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    const previouslyFocused = document.activeElement;

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    };
  }, [handleKeyDown]);

  // Auto-focus solo una vez al montar
  useEffect(() => {
    const modal = modalRef.current;
    if (modal) {
      const firstInput = modal.querySelector(
        'input:not([disabled]), textarea:not([disabled]), select:not([disabled])'
      );
      const firstFocusable = firstInput || modal.querySelector(FOCUSABLE_SELECTOR);
      if (firstFocusable) firstFocusable.focus();
    }
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div ref={modalRef} className={`modal-content ${className}`} onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          ×
        </button>
        {title && <div className="modal-title">{title}</div>}
        {children}
      </div>
    </div>
  );
}
