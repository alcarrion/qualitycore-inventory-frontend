// src/pages/CustomersPage.js
import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import AddCustomerForm from "../components/AddCustomerForm";
import EditCustomerForm from "../components/EditCustomerForm";
import { patchCustomer } from "../services/api";
import { useCustomersData } from "../hooks/useCustomersData";
import { useApp } from "../contexts/AppContext";
import "../styles/pages/CustomersPage.css";

export default function CustomersPage({ user }) {
  const { showSuccess, showError, showWarning, setLoading } = useApp();
  const currentUser = user || JSON.parse(localStorage.getItem("user"));
  const role = (currentUser?.role || "").toLowerCase();

  const CAN_ADD = ["administrator", "superadmin", "super administrador", "user"].includes(role);
  const CAN_EDIT = ["administrator", "superadmin", "super administrador", "user"].includes(role);
  const CAN_DELETE = ["superadmin", "super administrador"].includes(role); // Solo SuperAdmin puede eliminar

  const { customers, fetchCustomers, error: dataError } = useCustomersData();

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [search, setSearch] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  useEffect(() => {
    if (dataError) showError(dataError);
  }, [dataError, showError]);

  const filtered = customers.filter(
    (c) =>
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
      (c.document && c.document.includes(search)) ||
      (c.phone && c.phone.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (customer) => {
    if (!CAN_DELETE) {
      showWarning("No tienes permisos para eliminar clientes.");
      return;
    }

    // Mostrar modal de confirmación
    setCustomerToDelete(customer);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    setLoading(true);
    try {
      const resp = await patchCustomer(customerToDelete.id, {
        deleted_at: new Date().toISOString(),
      });
      if (!resp.ok) throw new Error(resp.data?.detail || "No se pudo eliminar.");
      fetchCustomers();
      showSuccess("Cliente eliminado correctamente.");
    } catch (e) {
      showError(e.message || "Error al eliminar el cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customers-page-container">
      <div className="customers-header">
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
        {filtered.map((customer) => {
          // Función para obtener el label del tipo de documento
          const getDocumentLabel = (type) => {
            switch (type) {
              case 'cedula':
                return 'Cédula:';
              case 'ruc':
                return 'RUC:';
              case 'passport':
                return 'Pasaporte:';
              default:
                return 'Documento:';
            }
          };

          return (
            <div key={customer.id} className="customer-card">
              <div className="customer-info">
                <div className="customer-main">
                  <div className="customer-name">{customer.name || "-"}</div>
                  <div className="customer-detail">
                    <span className="customer-label">{getDocumentLabel(customer.document_type)}</span> {customer.document || "-"}
                  </div>
                </div>
              <div className="customer-contact">
                <div className="customer-detail">
                  <span className="customer-label">Email:</span> {customer.email || "-"}
                </div>
                <div className="customer-detail">
                  <span className="customer-label">Tel:</span> {customer.phone || "-"}
                </div>
              </div>
              <div className="customer-address">
                <span className="customer-label">Dirección:</span> {customer.address || "-"}
              </div>
            </div>

            {(CAN_EDIT || CAN_DELETE) && (
              <div className="customer-actions">
                {CAN_EDIT && (
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setEditingCustomer(customer);
                      setShowEdit(true);
                    }}
                  >
                    <FaEdit />
                  </button>
                )}

                {CAN_DELETE && (
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(customer)}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="no-data">No hay clientes para mostrar.</div>
        )}
      </div>

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <AddCustomerForm
            onSave={() => {
              setShowAdd(false);
              fetchCustomers();
            }}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}

      {showEdit && editingCustomer && (
        <Modal
          onClose={() => {
            setShowEdit(false);
            setEditingCustomer(null);
          }}
        >
          <EditCustomerForm
            customer={editingCustomer}
            onSave={() => {
              setShowEdit(false);
              setEditingCustomer(null);
              fetchCustomers();
            }}
            onCancel={() => {
              setShowEdit(false);
              setEditingCustomer(null);
            }}
          />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setCustomerToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar al cliente "${customerToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
