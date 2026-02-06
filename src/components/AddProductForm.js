// src/components/AddProductForm.js
import React, { useState, useEffect } from "react";
import {
  getSuppliers,
  getCategories,
  postCategory,
  postProduct,
} from "../services/api";
import { useApp } from "../contexts/AppContext";
import { validateImage } from "../utils/validateImage";
import { ERRORS, SUCCESS, ENTITIES } from "../constants/messages";
import "../styles/components/Form.css";

export default function AddProductForm({ onSave, onCancel }) {
  const { showSuccess, showError } = useApp();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [supplier, setSupplier] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [price, setPrice] = useState("");
  const [minimumStock, setMinimumStock] = useState("");
  const [status, setStatus] = useState("Activo");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    if (!name || !price || !minimumStock || !category || !supplier) {
      showError(ERRORS.REQUIRED_FIELDS);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    if (description) formData.append("description", description);
    formData.append("category", category);
    formData.append("price", String(price));
    formData.append("minimum_stock", String(minimumStock));
    formData.append("status", status);
    formData.append("supplier", supplier);
    if (image) formData.append("image", image);

    try {
      const res = await postProduct(formData);
      if (!res.ok) {
        if (res.data && typeof res.data === 'object' && !res.data.detail) {
          const errorMessages = Object.entries(res.data)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return messages.join(', ');
              }
              return messages;
            })
            .join('. ');
          showError(errorMessages || ERRORS.CREATE_FAILED(ENTITIES.PRODUCT));
        } else {
          showError(res.data?.detail || ERRORS.CREATE_FAILED(ENTITIES.PRODUCT));
        }
        setLoading(false);
        return;
      }
      showSuccess(SUCCESS.CREATED('Producto'));
      onSave?.(res.data);
    } catch (e) {
      showError(e.message || ERRORS.CREATE_FAILED(ENTITIES.PRODUCT));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="form-title">Añadir producto</div>

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
        <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileChange} />
        <small style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          Formatos: JPG, PNG. Tamaño máximo: 2MB. Dimensiones: 300x300px a 2000x2000px.
        </small>
      </div>

      <div className="form-actions">
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Añadir"}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
