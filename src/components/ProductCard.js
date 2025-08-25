import React, { useState, useCallback, useMemo } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function ProductCard({ producto, onEdit, onDelete, isAdmin }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Calcular la URL de imagen solo cuando cambian los datos del producto
  const imageSrc = useMemo(() => {
    if (imageError) return null;
    
    // Prioridad: image_url > image > null
    if (producto.image_url && typeof producto.image_url === 'string' && producto.image_url.trim()) {
      return producto.image_url;
    }
    
    if (producto.image && typeof producto.image === 'string' && producto.image.trim()) {
      return producto.image;
    }
    
    return null;
  }, [producto.image_url, producto.image, imageError]);

  // Reset de estados cuando cambia el producto
  React.useEffect(() => {
    setImageError(false);
    setImageLoading(!!imageSrc); // Solo "loading" si hay imagen que cargar
  }, [producto.id, imageSrc]);

  const handleImageError = useCallback(() => {
    console.log('Image failed to load:', imageSrc);
    setImageError(true);
    setImageLoading(false);
  }, [imageSrc]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  return (
    <div className="product-card">
      {/* Contenedor de imagen con manejo de estados */}
      <div className="product-card-img-container">
        {imageSrc && !imageError ? (
          <>
            {imageLoading && (
              <div className="product-card-img-placeholder loading">
                Cargando...
              </div>
            )}
            <img
              src={imageSrc}
              alt={producto.name || 'Producto'}
              className="product-card-img"
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
          </>
        ) : (
          <div className="product-card-img-placeholder">
            <div className="no-image-icon">📦</div>
            <span>Sin imagen</span>
          </div>
        )}
      </div>

      <div className="product-card-content">
        <div className="product-card-title">{producto.name || 'Sin nombre'}</div>
        
        <div className="product-card-info">
          <strong>Categoría:</strong> {producto.category_name || "-"}
        </div>
        
        <div className="product-card-info">
          <strong>Proveedor:</strong> {producto.supplier_name || "-"}
        </div>
        
        <div className="product-card-info">
          <strong>Precio:</strong> ${producto.price || '0.00'}
        </div>
        
        <div className="product-card-info">
          <strong>Stock:</strong> {producto.current_stock ?? producto.stock ?? 0}
        </div>
        
        <div className="product-card-info">
          <strong>Estado:</strong> 
          <span className={`status ${producto.status === 'Activo' ? 'active' : 'inactive'}`}>
            {producto.status || 'Sin estado'}
          </span>
        </div>
        
        {isAdmin && (
          <div className="product-card-actions">
            <button 
              className="btn-icon" 
              onClick={() => onEdit(producto)}
              title="Editar producto"
            >
              <FaEdit />
            </button>
            <button 
              className="btn-icon btn-delete" 
              onClick={() => onDelete(producto)}
              title="Eliminar producto"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}