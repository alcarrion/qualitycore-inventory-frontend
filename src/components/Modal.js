// src/components/Modal.js
import React from "react";

export default function Modal({ children, onClose }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 8px 32px #0002",
        padding: 28,
        minWidth: 320,
        maxWidth: "98vw",
        maxHeight: "90vh",        
        overflowY: "auto",        
        position: "relative"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 18, background: "none",
            border: "none", fontSize: 22, color: "#999", cursor: "pointer"
          }}
        >×</button>
        {children}
      </div>
    </div>
  );
}