// src/components/LoadingSpinner.js
import React from "react";
import "../styles/components/LoadingSpinner.css";

/**
 * Componente de loading spinner reutilizable
 *
 * @param {string} size - Tamaño: "small", "medium", "large" (default: "medium")
 * @param {string} message - Mensaje opcional a mostrar
 * @param {boolean} fullScreen - Si debe cubrir toda la pantalla
 */
export default function LoadingSpinner({
  size = "medium",
  message = "",
  fullScreen = false
}) {
  const sizeClass = `spinner-${size}`;

  if (fullScreen) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className={`spinner-circle ${sizeClass}`}></div>
          {message && <p className="loading-message">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <div className={`spinner-circle ${sizeClass}`}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}
