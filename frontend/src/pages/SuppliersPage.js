// src/pages/SuppliersPage.js
import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { API_URL, getCookie } from "../services/api";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import AddSupplierForm from "../components/AddSupplierForm";
import EditSupplierForm from "../components/EditSupplierForm";
import "../styles/pages/SuppliersPage.css";

export default function SuppliersPage({ user }) {
  const currentUser = user || JSON.parse(localStorage.getItem("user"));
  const [suppliers, setSuppliers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [search, setSearch] = useState("");

  const isAdmin = currentUser?.role === "Administrator";

  useEffect(() => {
    fetch(`${API_URL}/suppliers/`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setSuppliers(data.filter(p => !p.deleted_at)))
      .catch(() => setSuppliers([]));
  }, [showAdd, showEdit]);

  const filtered = suppliers.filter(p =>
    (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
    (p.tax_id && p.tax_id.includes(search)) ||
    (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
    (p.phone && p.phone.includes(search))
  );

  const handleDelete = (supplier) => {
    if (!window.confirm("¿Seguro que deseas eliminar este proveedor?")) return;
    fetch(`${API_URL}/suppliers/${supplier.id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      credentials: "include",
      body: JSON.stringify({ deleted_at: new Date().toISOString() }),
    })
      .then(res => res.json())
      .then(() => setSuppliers(prev => prev.filter(p => p.id !== supplier.id)));
  };

  return (
    <div className="suppliers-page-container">
      <div className="suppliers-header">
        <button className="back-btn" onClick={() => window.history.back()}>←</button>
        <h2>PROVEEDORES</h2>
      </div>
      <div className="suppliers-actions">
        <div className="search-bar">
          <FaSearch />
          <input
            placeholder="Buscar proveedores..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {isAdmin && (
          <button className="btn-add-supplier" onClick={() => setShowAdd(true)}>
            <FaPlus /> AÑADIR PROVEEDOR
          </button>
        )}
      </div>
      <div className="suppliers-list">
        {filtered.map(supplier => (
          <div key={supplier.id} className="supplier-card">
            <div><strong>NOMBRE:</strong> {supplier.name}</div>
            <div><strong>CORREO:</strong> {supplier.email || "-"}</div>
            <div><strong>RUC / CÉDULA:</strong> {supplier.tax_id || "-"}</div>
            <div><strong>TELÉFONO:</strong> {supplier.phone || "-"}</div>
            <div><strong>DIRECCIÓN:</strong> {supplier.address || "-"}</div>
            {isAdmin && (
              <div className="supplier-actions">
                <button className="btn-icon"
                  onClick={() => { setEditingSupplier(supplier); setShowEdit(true); }}>
                  <FaEdit />
                </button>
                <button className="btn-icon btn-delete" onClick={() => handleDelete(supplier)}>
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="no-data">No hay proveedores para mostrar.</div>}
      </div>
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <AddSupplierForm
            onSave={() => setShowAdd(false)}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}
      {showEdit && editingSupplier && (
        <Modal onClose={() => { setShowEdit(false); setEditingSupplier(null); }}>
          <EditSupplierForm
            proveedor={editingSupplier}
            onSave={() => {
              setShowEdit(false);
              setEditingSupplier(null);
            }}
            onCancel={() => {
              setShowEdit(false);
              setEditingSupplier(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
