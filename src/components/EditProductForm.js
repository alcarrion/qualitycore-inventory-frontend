// src/components/EditProductForm.js
import React, { useState, useEffect } from "react";
import {
  getSuppliers,
  getCategories,
  postCategory,
  patchProduct,
} from "../services/api";
import "../styles/components/Form.css";

export default function EditProductForm({ producto, onSave, onCancel }) {
  const [name, setName] = useState(producto.name);
  const [description, setDescription] = useState(producto.description || "");
  const [category, setCategory] = useState(String(producto.category || ""));
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [supplier, setSupplier] = useState(String(producto.supplier || ""));
  const [suppliers, setSuppliers] = useState([]);
  const [price, setPrice] = useState(producto.price);
  const [currentStock] = useState(producto.current_stock ?? producto.currentStock); 
  const [minimumStock, setMinimumStock] = useState(producto.minimum_stock ?? producto.minimumStock);
  const [status, setStatus] = useState(producto.status);
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const ps = await getSuppliers();
      setSuppliers(Array.isArray(ps.data) ? ps.data.filter(p => !p.deleted_at) : []);
      const cs = await getCategories();
      setCategories(Array.isArray(cs.data) ? cs.data : []);
    })();
  }, []);

  const handleFileChange = (e) => setImage(e.target.files[0]);

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

  const handleSubmit = async (e) => {
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
    formData.append("category", String(category));          
    formData.append("price", String(price));
    formData.append("minimum_stock", String(minimumStock));   
    formData.append("status", status);
    formData.append("supplier", String(supplier));         
    if (image) formData.append("image", image);

    try {
      const res = await patchProduct(producto.id, formData); 
      if (!res.ok) throw new Error(res.data?.detail || "No se pudo editar el producto.");
      onSave?.(res.data);
    } catch (e) {
      setError(e.message || "Error al editar producto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="form-title">Editar producto</div>

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
        <label>Stock actual</label>
        <input type="number" value={currentStock ?? 0} disabled />
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
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
