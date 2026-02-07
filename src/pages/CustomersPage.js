// src/pages/CustomersPage.js
import React, { useState, useEffect, useMemo } from "react";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination from "../components/Pagination";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import CustomerForm from "../components/CustomerForm";
import { patchCustomer } from "../services/api";
import { useDataStore } from "../store/dataStore";
import { useApp } from "../contexts/AppContext";
import { PERMISSIONS } from "../constants/roles";
import { ERRORS, SUCCESS, ENTITIES, CONFIRM } from "../constants/messages";
import { PAGINATION } from "../constants/config";
import "../styles/pages/CustomersPage.css";

export default function CustomersPage({ user }) {
  const { showSuccess, showError, showWarning, setLoading } = useApp();
  const currentUser = user || JSON.parse(localStorage.getItem("user"));
  const role = currentUser?.role || "";

  // Permisos basados en rol (usando constantes centralizadas)
  const CAN_ADD = PERMISSIONS.CAN_ADD_CUSTOMER(role);
  const CAN_EDIT = PERMISSIONS.CAN_EDIT_CUSTOMER(role);
  const CAN_DELETE = PERMISSIONS.CAN_DELETE_CUSTOMER(role);

  // Zustand store - estado centralizado
  const customers = useDataStore(state => state.customers);
  const fetchCustomers = useDataStore(state => state.fetchCustomers);
  const dataError = useDataStore(state => state.error);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [search, setSearch] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (dataError) showError(dataError);
  }, [dataError, showError]);

  // Resetear a página 1 cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = useMemo(() => customers.filter(
    (c) =>
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
      (c.document && c.document.includes(search)) ||
      (c.phone && c.phone.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase()))
  ), [customers, search]);

  // Calcular paginación
  const totalPages = Math.ceil(filtered.length / PAGINATION.DEFAULT_PAGE_SIZE);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGINATION.DEFAULT_PAGE_SIZE;
    return filtered.slice(startIndex, startIndex + PAGINATION.DEFAULT_PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleDelete = async (customer) => {
    if (!CAN_DELETE) {
      showWarning(ERRORS.ONLY_SUPER_ADMIN);
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
      if (!resp.ok) throw new Error(resp.data?.detail || ERRORS.DELETE_FAILED(ENTITIES.CUSTOMER));
      fetchCustomers();
      showSuccess(SUCCESS.DELETED(ENTITIES.CUSTOMER));
    } catch (e) {
      showError(e.message || ERRORS.DELETE_FAILED(ENTITIES.CUSTOMER));
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
        {paginatedCustomers.map((customer) => {
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

      {/* Paginación */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filtered.length}
        pageSize={PAGINATION.DEFAULT_PAGE_SIZE}
      />

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <CustomerForm
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
          <CustomerForm
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
        message={CONFIRM.DELETE(ENTITIES.CUSTOMER, customerToDelete?.name)}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
