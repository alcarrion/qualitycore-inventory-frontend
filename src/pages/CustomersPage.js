// src/pages/CustomersPage.js
import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import AddCustomerForm from "../components/AddCustomerForm";
import EditCustomerForm from "../components/EditCustomerForm";
import { getCustomers, patchCustomer } from "../services/api";
import "../styles/pages/CustomersPage.css";

export default function CustomersPage({ user }) {
  const currentUser = user || JSON.parse(localStorage.getItem("user"));
  const role = (currentUser?.role || "").toLowerCase();

  const CAN_ADD = ["administrator", "user"].includes(role);
  const CAN_EDIT = ["administrator", "user"].includes(role);
  const CAN_DELETE = ["administrator"].includes(role);

  const [clientes, setClientes] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const res = await getCustomers();
      const list = Array.isArray(res.data) ? res.data : [];
      setClientes(list.filter((c) => !c.deleted_at));
    })();
  }, [showAdd, showEdit]);

  const filtered = clientes.filter(
    (c) =>
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
      (c.document && c.document.includes(search)) ||
      (c.phone && c.phone.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (cliente) => {
    if (!CAN_DELETE) {
      alert("No tienes permisos para eliminar clientes.");
      return;
    }

    if (!window.confirm("¿Seguro que deseas eliminar este cliente?")) return;
    try {
      const resp = await patchCustomer(cliente.id, {
        deleted_at: new Date().toISOString(),
      });
      if (!resp.ok) throw new Error(resp.data?.detail || "No se pudo eliminar.");
      setClientes((prev) => prev.filter((c) => c.id !== cliente.id));
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
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {CAN_ADD && (
          <button className="btn-add-customer" onClick={() => setShowAdd(true)}>
            <FaPlus /> AÑADIR CLIENTES
          </button>
        )}
      </div>

      <div className="customers-list">
        {filtered.map((cliente) => (
          <div key={cliente.id} className="customer-card">
            <div>
              <strong>NOMBRE:</strong> {cliente.name || "-"}
            </div>
            <div>
              <strong>CORREO:</strong> {cliente.email || "-"}
            </div>
            <div>
              <strong>TELÉFONO:</strong> {cliente.phone || "-"}
            </div>
            <div>
              <strong>CÉDULA:</strong> {cliente.document || "-"}
            </div>

            {(CAN_EDIT || CAN_DELETE) && (
              <div className="customer-actions">
                {CAN_EDIT && (
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setEditingCliente(cliente);
                      setShowEdit(true);
                    }}
                  >
                    <FaEdit />
                  </button>
                )}

                {CAN_DELETE && (
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(cliente)}
                  >
                    <FaTrash />
                  </button>
                )}
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
        <Modal
          onClose={() => {
            setShowEdit(false);
            setEditingCliente(null);
          }}
        >
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
