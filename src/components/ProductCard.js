import React, { useState, memo } from "react";
import ReactDOM from "react-dom";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";

// ✅ Optimización: React.memo para evitar re-renders innecesarios
// Solo se re-renderiza si las props cambian
function ProductCard({ product, onEdit, onDelete, isAdmin, canDelete = false }) {
  const [showImageModal, setShowImageModal] = useState(false);

  // Solo mostrar imagen si es URL de Cloudinary válida
  const showImage = product.image_url &&
                   typeof product.image_url === 'string' &&
                   product.image_url.includes('cloudinary.com');

  return (
    <div className="product-card">
      <div
        className="product-card-img-container"
        onClick={() => showImage && setShowImageModal(true)}
        style={{ cursor: showImage ? 'pointer' : 'default' }}
      >
        {showImage ? (
          <img
            src={product.image_url}
            alt={product.name}
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
          <div className="no-image-text">Sin imagen</div>
        </div>
      </div>

      <div className="product-card-info-wrapper">
        <div className="product-main-info">
          <div className="product-card-title">{product.name || 'Sin nombre'}</div>
          <div className="product-detail">
            <span className="product-label">Stock:</span> {product.current_stock ?? product.stock ?? 0}
          </div>
        </div>

        <div className="product-secondary-info">
          <div className="product-detail">
            <span className="product-label">Categoría:</span> {product.category_name || "-"}
          </div>
          <div className="product-detail">
            <span className="product-label">Proveedor:</span> {product.supplier_name || "-"}
          </div>
        </div>

        <div className="product-price-info">
          <div className="product-detail">
            <span className="product-label">Precio:</span> ${parseFloat(product.price || 0).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="product-detail">
            <span className="product-label">Estado:</span> {product.is_active ? 'Activo' : 'Inactivo'}
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="product-card-actions">
          <button className="btn-icon" onClick={() => onEdit(product)}><FaEdit /></button>
          {canDelete && (
            <button className="btn-icon btn-delete" onClick={() => onDelete(product)}><FaTrash /></button>
          )}
        </div>
      )}

      {showImageModal && showImage && ReactDOM.createPortal(
        <div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
          <button className="image-modal-close" onClick={() => setShowImageModal(false)}>
            <FaTimes />
          </button>
          <img
            src={product.image_url}
            alt={product.name}
            className="image-modal-img"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="image-modal-title">{product.name}</div>
        </div>,
        document.body
      )}
    </div>
  );
}

// Exportar con React.memo para optimización de rendimiento
export default memo(ProductCard);