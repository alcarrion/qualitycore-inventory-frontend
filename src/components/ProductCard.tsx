// src/components/ProductCard.tsx
import React, { useState, memo } from "react";
import ReactDOM from "react-dom";
import { Pencil, Trash2, X } from "lucide-react";
import type { Product } from "../types/models";

interface Props {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  isAdmin: boolean;
  canDelete?: boolean;
}

function ProductCard({ product, onEdit, onDelete, isAdmin, canDelete = false }: Props) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imageUrl = product.image_url ?? product.image;

  // Mostrar imagen si el backend provee una URL y no hubo error de carga.
  // La validación del origen (CDN, S3, etc.) corresponde al backend — no al componente.
  const showImage = !imgError && !!imageUrl && typeof imageUrl === 'string';

  return (
    <div className="product-card">
      <div
        className="product-card-img-container"
        onClick={() => showImage && setShowImageModal(true)}
        style={{ cursor: showImage ? 'pointer' : 'default' }}
      >
        {showImage ? (
          <img
            src={imageUrl!}
            alt={product.name}
            className="product-card-img"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="product-card-img-placeholder" style={{ display: 'flex' }}>
            <div className="no-image-text">Sin imagen</div>
          </div>
        )}
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
            <span className="product-label">Precio:</span> ${parseFloat(String(product.price || 0)).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="product-detail">
            <span className="product-label">Estado:</span> {product.is_active ? 'Activo' : 'Inactivo'}
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="product-card-actions">
          <button className="btn-icon" onClick={() => onEdit(product)}><Pencil size={16} /></button>
          {canDelete && (
            <button className="btn-icon btn-delete" onClick={() => onDelete(product)}><Trash2 size={16} /></button>
          )}
        </div>
      )}

      {showImageModal && showImage && ReactDOM.createPortal(
        <div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
          <button className="image-modal-close" onClick={() => setShowImageModal(false)}>
            <X size={16} />
          </button>
          <img
            src={imageUrl!}
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

export default memo(ProductCard);
