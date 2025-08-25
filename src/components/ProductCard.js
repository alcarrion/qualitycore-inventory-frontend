import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function ProductCard({ producto, onEdit, onDelete, isAdmin }) {
  const placeholder = "/placeholder.png"; // pon esta imagen en public/
  const src =
    (producto.image_url && /^https?:\/\//.test(producto.image_url) && producto.image_url) ||
    (producto.image && /^https?:\/\//.test(producto.image) && producto.image) ||
    placeholder;

  return (
    <div className="product-card">
      <img
        src={src}
        alt={producto.name}
        className="product-card-img"
        onError={(e) => { e.currentTarget.src = placeholder; }}
      />
      <div className="product-card-content">
        <div className="product-card-title">{producto.name}</div>
        <div className="product-card-info"><strong>Categoría:</strong> {producto.category_name || "-"}</div>
        <div className="product-card-info"><strong>Proveedor:</strong> {producto.supplier_name || "-"}</div>
        <div className="product-card-info"><strong>Precio:</strong> ${producto.price}</div>
        <div className="product-card-info"><strong>Stock:</strong> {producto.current_stock}</div>
        <div className="product-card-info"><strong>Estado:</strong> {producto.status}</div>
        {isAdmin && (
          <div className="product-card-actions">
            <button className="btn-icon" onClick={() => onEdit(producto)}><FaEdit /></button>
            <button className="btn-icon btn-delete" onClick={() => onDelete(producto)}><FaTrash /></button>
          </div>
        )}
      </div>
    </div>
  );
}
