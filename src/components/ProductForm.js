// src/components/ProductForm.js
// Form unificado para crear y editar productos
import React, { useState, useEffect } from "react";
import {
  getSuppliers,
  getCategories,
  postCategory,
  postProduct,
  patchProduct,
} from "../services/api";
import { useApp } from "../contexts/AppContext";
import { validateImage } from "../utils/validateImage";
import { ERRORS, SUCCESS, ENTITIES } from "../constants/messages";
import "../styles/components/Form.css";

/**
 * ProductForm - Formulario unificado para crear/editar productos
 * @param {Object} product - Producto a editar (null para crear nuevo)
 * @param {Function} onSave - Callback al guardar exitosamente
 * @param {Function} onCancel - Callback al cancelar
 */
export default function ProductForm({ product = null, onSave, onCancel }) {
  const isEditing = !!product;
  const { showSuccess, showError } = useApp();

  // Estado del formulario - usa valores del producto si existe, sino vacío
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [category, setCategory] = useState(product ? String(product.category || "") : "");
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [supplier, setSupplier] = useState(product ? String(product.supplier || "") : "");
  const [suppliers, setSuppliers] = useState([]);
  const [price, setPrice] = useState(product?.price || "");
  const [minimumStock, setMinimumStock] = useState(product?.minimum_stock ?? product?.minimumStock ?? "");
  const [status, setStatus] = useState(product?.status || "Activo");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Solo para modo edición
  const currentStock = product?.current_stock ?? product?.currentStock;
  const currentImageUrl = product?.image_url || product?.image;

  // Cargar proveedores y categorías
  useEffect(() => {
    (async () => {
      const ps = await getSuppliers();
      const suppliersList = ps.data?.results || ps.data || [];
      const suppliersArray = Array.isArray(suppliersList) ? suppliersList : [];
      setSuppliers(suppliersArray.filter(p => !p.deleted_at));

      const cs = await getCategories();
      const categoriesList = cs.data?.results || cs.data || [];
      const categoriesArray = Array.isArray(categoriesList) ? categoriesList : [];
      setCategories(categoriesArray);
    })();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isValid = await validateImage(file, showError);
    if (isValid) {
      setImage(file);
    } else {
      e.target.value = '';
      setImage(null);
    }
  };

  const handleWheel = (e) => {
    e.target.blur();
  };

  const handleNewCategory = async () => {
    if (!newCategory.trim()) return;
    setLoading(true);
    try {
      const res = await postCategory(newCategory.trim());
      if (!res.ok) {
        showError(res.data?.detail || ERRORS.CREATE_FAILED(ENTITIES.CATEGORY));
        setLoading(false);
        return;
      }
      const cat = res.data;
      setCategories(prev => [...prev, cat]);
      setTimeout(() => {
        setCategory(String(cat.id));
      }, 0);
      setNewCategory("");
      showSuccess(SUCCESS.CREATED('Categoría'));
    } catch (e) {
      showError(e.message || ERRORS.CREATE_FAILED(ENTITIES.CATEGORY));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validar campos requeridos
    if (!name || !price || !minimumStock || !category || !supplier) {
      showError(ERRORS.REQUIRED_FIELDS);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    if (description) formData.append("description", description);
    formData.append("category", String(category));
    formData.append("price", String(price));
    formData.append("minimum_stock", String(minimumStock));
    formData.append("status", status);
    formData.append("supplier", String(supplier));
    if (image) formData.append("image", image);

    try {
      // Crear o actualizar según el modo
      const res = isEditing
        ? await patchProduct(product.id, formData)
        : await postProduct(formData);

      if (!res.ok) {
        // Manejar errores de validación del backend
        if (res.data && typeof res.data === 'object' && !res.data.detail) {
          const errorMessages = Object.entries(res.data)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return messages.join(', ');
              }
              return messages;
            })
            .join('. ');

          const errorMsg = isEditing
            ? ERRORS.UPDATE_FAILED(ENTITIES.PRODUCT)
            : ERRORS.CREATE_FAILED(ENTITIES.PRODUCT);
          showError(errorMessages || errorMsg);
        } else {
          const errorMsg = isEditing
            ? ERRORS.UPDATE_FAILED(ENTITIES.PRODUCT)
            : ERRORS.CREATE_FAILED(ENTITIES.PRODUCT);
          showError(res.data?.detail || errorMsg);
        }
        setLoading(false);
        return;
      }

      // Éxito
      const successMsg = isEditing
        ? SUCCESS.UPDATED('Producto')
        : SUCCESS.CREATED('Producto');
      showSuccess(successMsg);
      onSave?.(res.data);
    } catch (e) {
      const errorMsg = isEditing
        ? ERRORS.UPDATE_FAILED(ENTITIES.PRODUCT)
        : ERRORS.CREATE_FAILED(ENTITIES.PRODUCT);
      showError(e.message || errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="form-title">
        {isEditing ? "Editar producto" : "Añadir producto"}
      </div>

      <div className="form-group">
        <label>Nombre *</label>
        <input value={name} onChange={e => setName(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Descripción</label>
        <input value={description} onChange={e => setDescription(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Categoría *</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          required
          key={categories.length}
        >
          <option value="">Seleccione</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <input
            placeholder="Nueva categoría"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
          />
          <button type="button" onClick={handleNewCategory} disabled={loading || !newCategory}>
            Añadir
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>Proveedor *</label>
        <select value={supplier} onChange={e => setSupplier(e.target.value)} required>
          <option value="">Seleccione</option>
          {suppliers.map(prov => (
            <option key={prov.id} value={prov.id}>{prov.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Precio *</label>
        <input
          type="number"
          min={0}
          value={price}
          onChange={e => setPrice(e.target.value)}
          onWheel={handleWheel}
          required
        />
      </div>

      {/* Stock actual solo visible en modo edición */}
      {isEditing && (
        <div className="form-group">
          <label>Stock actual</label>
          <input type="number" value={currentStock ?? 0} disabled />
        </div>
      )}

      <div className="form-group">
        <label>Stock mínimo *</label>
        <input
          type="number"
          min={0}
          value={minimumStock}
          onChange={e => setMinimumStock(e.target.value)}
          onWheel={handleWheel}
          required
        />
      </div>

      <div className="form-group">
        <label>Estado *</label>
        <select value={status} onChange={e => setStatus(e.target.value)} required>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>

      <div className="form-group">
        <label>Imagen</label>
        {/* Preview de imagen actual solo en modo edición */}
        {isEditing && currentImageUrl && currentImageUrl.trim() !== '' && (
          <div style={{ marginBottom: 'var(--space-sm)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              padding: 'var(--space-sm)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
              transition: 'all var(--transition-base)'
            }}>
              <img
                src={currentImageUrl}
                alt="Imagen actual"
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-primary)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
                  Imagen actual
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '2px', wordBreak: 'break-all' }}>
                  {currentImageUrl.includes('/') ? currentImageUrl.split('/').pop() : currentImageUrl}
                </div>
              </div>
            </div>
          </div>
        )}
        <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileChange} />
        <small style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          {isEditing && currentImageUrl && currentImageUrl.trim() !== '' ? 'Selecciona una nueva imagen para reemplazar la actual. ' : ''}
          Formatos: JPG, PNG. Tamaño máximo: 2MB. Dimensiones: 300x300px a 2000x2000px.
        </small>
      </div>

      <div className="form-actions">
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Guardando..." : (isEditing ? "Guardar" : "Añadir")}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
