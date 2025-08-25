import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function ProductCard({ producto, onEdit, onDelete, isAdmin }) {
  // Solo mostrar imagen si es URL de Cloudinary válida
  const showImage = producto.image_url && 
                   typeof producto.image_url === 'string' && 
                   producto.image_url.includes('cloudinary.com');

  return (
    <div className="product-card">
      <div className="product-card-img-container">
        {showImage ? (
          <img
            src={producto.image_url}
            alt={producto.name}
            className="product-card-img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        <div 
          className="product-card-img-placeholder"
          style={{ display: showImage ? 'none' : 'flex' }}
        >
          <div className="no-image-icon">📦</div>
          <span>Sin imagen</span>
        </div>
      </div>

      <div className="product-card-content">
        <div className="product-card-title">{producto.name || 'Sin nombre'}</div>
        <div className="product-card-info"><strong>Categoría:</strong> {producto.category_name || "-"}</div>
        <div className="product-card-info"><strong>Proveedor:</strong> {producto.supplier_name || "-"}</div>
        <div className="product-card-info"><strong>Precio:</strong> ${producto.price || '0.00'}</div>
        <div className="product-card-info"><strong>Stock:</strong> {producto.current_stock ?? producto.stock ?? 0}</div>
        <div className="product-card-info"><strong>Estado:</strong> {producto.status || 'Sin estado'}</div>
        
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