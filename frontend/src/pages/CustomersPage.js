// src/pages/CustomersPage.js
import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { API_URL, getCookie } from "../services/api"; 
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa"; 
import AddCustomerForm from "../components/AddCustomerForm";
import EditCustomerForm from "../components/EditCustomerForm";
import "../styles/pages/CustomersPage.css"; 

export default function CustomersPage({ user }) {
  const currentUser = user || JSON.parse(localStorage.getItem("user"));
  const [clientes, setClientes] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [search, setSearch] = useState("");

  // Solo admins pueden añadir/editar/eliminar
  const isAdmin = currentUser?.role === "Administrator";

  // Cargar clientes
  useEffect(() => {
    fetch(`${API_URL}/customers/`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setClientes(data.filter(c => !c.deleted_at)))
      .catch(() => setClientes([]));
  }, [showAdd, showEdit]);

  // Filtrar clientes por búsqueda (usando los nombres REALES del backend)
  const filtered = clientes.filter(c =>
    (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
    (c.tax_id && c.tax_id.includes(search)) ||
    (c.phone && c.phone.includes(search)) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = (cliente) => {
    if (!window.confirm("¿Seguro que deseas eliminar este cliente?")) return;
    fetch(`${API_URL}/customers/${cliente.id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      credentials: "include",
      body: JSON.stringify({ deleted_at: new Date().toISOString() }),
    })
      .then(res => res.json())
      .then(() => setClientes(prev => prev.filter(c => c.id !== cliente.id)));
  };

  return (
    <div className="customers-page-container">
      <div className="customers-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          ←
        </button>
        <h2>CLIENTES</h2>
      </div>
      <div className="customers-actions">
        <div className="search-bar">
          <FaSearch />
          <input
            placeholder="Buscar clientes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {isAdmin && (
          <button className="btn-add-customer" onClick={() => setShowAdd(true)}>
            <FaPlus /> AÑADIR CLIENTES
          </button>
        )}
      </div>

      <div className="customers-list">
        {filtered.map(cliente => (
          <div key={cliente.id} className="customer-card">
            <div><strong>NOMBRE:</strong> {cliente.name || "-"}</div>
            <div><strong>CORREO:</strong> {cliente.email || "-"}</div>
            <div><strong>TELÉFONO:</strong> {cliente.phone || "-"}</div>
            <div><strong>CÉDULA:</strong> {cliente.document || "-"}</div>
            {isAdmin && (
              <div className="customer-actions">
                <button
                  className="btn-icon"
                  onClick={() => {
                    setEditingCliente(cliente);
                    setShowEdit(true);
                  }}
                >
                  <FaEdit />
                </button>
                <button className="btn-icon btn-delete" onClick={() => handleDelete(cliente)}>
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="no-data">No hay clientes para mostrar.</div>
        )}
      </div>

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <AddCustomerForm
            onSave={() => setShowAdd(false)}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}

      {showEdit && editingCliente && (
        <Modal onClose={() => { setShowEdit(false); setEditingCliente(null); }}>
          <EditCustomerForm
            cliente={editingCliente}
            onSave={() => {
              setShowEdit(false);
              setEditingCliente(null);
            }}
            onCancel={() => {
              setShowEdit(false);
              setEditingCliente(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
