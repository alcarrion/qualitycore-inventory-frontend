// src/components/ProductForm.js
// Form unificado para crear y editar productos
import React, { useState, useEffect, useMemo } from "react";
import {
  getSuppliers,
  getCategories,
  postCategory,
  postProduct,
  patchProduct,
} from "../services/api";
import SearchableDropdown from "./SearchableDropdown";
import { useDropdownSearch } from "../hooks/useDropdownSearch";
import { useAbortSignal } from "../hooks/useAbortSignal";
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
  const getSignal = useAbortSignal();

  const STATUS_OPTIONS = useMemo(() => [
    { id: "Activo", name: "Activo" },
    { id: "Inactivo", name: "Inactivo" },
  ], []);

  const categoryDropdown = useDropdownSearch(categories);
  const supplierDropdown = useDropdownSearch(suppliers);
  const statusDropdown = useDropdownSearch(STATUS_OPTIONS);

  // Solo para modo edición
  const currentStock = product?.current_stock ?? product?.currentStock;
  const currentImageUrl = product?.image_url || product?.image;

  // Cargar proveedores y categorías
  useEffect(() => {
    const signal = getSignal();
    (async () => {
      const ps = await getSuppliers(null, { signal });
      if (ps.aborted) return;
      const suppliersList = ps.data?.results || ps.data || [];
      const suppliersArray = Array.isArray(suppliersList) ? suppliersList : [];
      const filteredSuppliers = suppliersArray.filter(p => !p.deleted_at);
      setSuppliers(filteredSuppliers);

      const cs = await getCategories(null, { signal });
      if (cs.aborted) return;
      const categoriesList = cs.data?.results || cs.data || [];
      const categoriesArray = Array.isArray(categoriesList) ? categoriesList : [];
      setCategories(categoriesArray);

      // Pre-fill dropdowns when editing
      if (isEditing) {
        if (product?.supplier) {
          const sup = filteredSuppliers.find(s => s.id === product.supplier);
          if (sup) supplierDropdown.select(sup.name);
        }
        if (product?.category) {
          const cat = categoriesArray.find(c => c.id === product.category);
          if (cat) categoryDropdown.select(cat.name);
        }
      }
    })();
    // Pre-fill status dropdown
    if (status) {
      const opt = STATUS_OPTIONS.find(o => o.id === status);
      if (opt) statusDropdown.select(opt.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setCategory(String(cat.id));
      categoryDropdown.select(cat.name);
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
        <SearchableDropdown
          label="Categoría *"
          dropdown={categoryDropdown}
          otherDropdowns={[supplierDropdown, statusDropdown]}
          onSelect={(item) => {
            categoryDropdown.select(item.name);
            setCategory(String(item.id));
          }}
          onDeselect={() => setCategory("")}
          placeholder="Buscar categoría..."
          emptyMessage="No se encontraron categorías"
          className="form-sd"
        />
        <div className="form-inline-row">
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
        <SearchableDropdown
          label="Proveedor *"
          dropdown={supplierDropdown}
          otherDropdowns={[categoryDropdown, statusDropdown]}
          onSelect={(item) => {
            supplierDropdown.select(item.name);
            setSupplier(String(item.id));
          }}
          onDeselect={() => setSupplier("")}
          placeholder="Buscar proveedor..."
          emptyMessage="No se encontraron proveedores"
          className="form-sd"
        />
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
        <SearchableDropdown
          label="Estado *"
          dropdown={statusDropdown}
          otherDropdowns={[categoryDropdown, supplierDropdown]}
          onSelect={(item) => {
            statusDropdown.select(item.name);
            setStatus(item.id);
          }}
          onDeselect={() => setStatus("")}
          placeholder="Seleccionar estado..."
          emptyMessage="No se encontraron estados"
          className="form-sd"
        />
      </div>

      <div className="form-group">
        <label>Imagen</label>
        {/* Preview de imagen actual solo en modo edición */}
        {isEditing && currentImageUrl && currentImageUrl.trim() !== '' && (
          <div className="form-image-preview">
            <div className="form-image-preview-card">
              <img
                src={currentImageUrl}
                alt="Imagen actual"
                className="form-image-preview-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="form-image-preview-info">
                <div className="form-image-preview-label">
                  Imagen actual
                </div>
                <div className="form-image-preview-filename">
                  {currentImageUrl.includes('/') ? currentImageUrl.split('/').pop() : currentImageUrl}
                </div>
              </div>
            </div>
          </div>
        )}
        <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileChange} />
        <small className="form-hint">
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
