// src/pages/CustomersPage.js
import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import AddCustomerForm from "../components/AddCustomerForm";
import EditCustomerForm from "../components/EditCustomerForm";
import { getClientes, patchCliente } from "../services/api"; // ✅ wrappers
import "../styles/pages/CustomersPage.css";

export default function CustomersPage({ user }) {
  const currentUser = user || JSON.parse(localStorage.getItem("user"));
  const [clientes, setClientes] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [search, setSearch] = useState("");

  const isAdmin = currentUser?.role === "Administrator";

  // Cargar clientes
  useEffect(() => {
    (async () => {
      const res = await getClientes();
      const list = Array.isArray(res.data) ? res.data : [];
      setClientes(list.filter(c => !c.deleted_at));
    })();
  }, [showAdd, showEdit]); // al cerrar modales, recarga

  // Filtrado (usa "document" en lugar de tax_id)
  const filtered = clientes.filter(c =>
    (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
    (c.document && c.document.includes(search)) ||
    (c.phone && c.phone.includes(search)) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (cliente) => {
    if (!window.confirm("¿Seguro que deseas eliminar este cliente?")) return;
    try {
      const resp = await patchCliente(cliente.id, {
        deleted_at: new Date().toISOString(),
      });
      if (!resp.ok) throw new Error(resp.data?.detail || "No se pudo eliminar.");
      setClientes(prev => prev.filter(c => c.id !== cliente.id));
    } catch (e) {
      alert(e.message || "Error al eliminar el cliente.");
    }
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
                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleDelete(cliente)}
                >
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
