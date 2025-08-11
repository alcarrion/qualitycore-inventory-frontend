// src/components/AddProductForm.js
import React, { useState, useEffect } from "react";
import {
  getSuppliers,
  getCategories,
  postCategory,
  postProduct,
} from "../services/api";
import "../styles/components/Form.css";

export default function AddProductForm({ onSave, onCancel }) {
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar proveedores y categorías
  useEffect(() => {
    (async () => {
      const ps = await getSuppliers();
      setSuppliers(Array.isArray(ps.data) ? ps.data.filter(p => !p.deleted_at) : []);

      const cs = await getCategories();
      setCategories(Array.isArray(cs.data) ? cs.data : []);
    })();
  }, []);

  const handleFileChange = e => setImage(e.target.files[0]);

  const handleNewCategory = async () => {
    if (!newCategory.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await postCategory(newCategory.trim());
      if (!res.ok) throw new Error(res.data?.detail || "No se pudo crear la categoría.");
      const cat = res.data;
      setCategories(prev => [...prev, cat]);
      setCategory(String(cat.id));
      setNewCategory("");
    } catch (e) {
      setError(e.message || "No se pudo crear la categoría.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name || !price || !minimumStock || !category || !supplier) {
      setError("Todos los campos marcados son obligatorios.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    if (description) formData.append("description", description);
    formData.append("category", category);               // id
    formData.append("price", String(price));
    formData.append("minimum_stock", String(minimumStock));
    formData.append("status", status);
    formData.append("supplier", supplier);               // id
    if (image) formData.append("image", image);

    try {
      const res = await postProduct(formData);           // 🟢 usa wrapper multipart
      if (!res.ok) throw new Error(res.data?.detail || "No se pudo crear el producto.");
      onSave?.(res.data);
    } catch (e) {
      setError(e.message || "Error al crear el producto.");
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
        <select value={category} onChange={e => setCategory(e.target.value)} required>
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
        <input type="number" min={0} value={price} onChange={e => setPrice(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Stock mínimo *</label>
        <input type="number" min={0} value={minimumStock} onChange={e => setMinimumStock(e.target.value)} required />
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
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      {error && <div className="form-error">{error}</div>}

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
