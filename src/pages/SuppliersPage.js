// src/pages/SuppliersPage.js
import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import AddSupplierForm from "../components/AddSupplierForm";
import EditSupplierForm from "../components/EditSupplierForm";
import { useApp } from "../contexts/AppContext";
import { useDataStore } from "../store/dataStore";
import { PERMISSIONS } from "../constants/roles";
import { ERRORS, SUCCESS, ENTITIES, CONFIRM } from "../constants/messages";
import "../styles/pages/SuppliersPage.css";

import { patchSupplier } from "../services/api";

export default function SuppliersPage({ user }) {
  const { showSuccess, showError, showWarning, setLoading } = useApp();
  const currentUser = user || JSON.parse(localStorage.getItem("user"));
  const role = currentUser?.role || "";

  // Permisos basados en rol
  const canAdd = PERMISSIONS.CAN_ADD_SUPPLIER(role);
  const canEdit = PERMISSIONS.CAN_EDIT_SUPPLIER(role);
  const canDelete = PERMISSIONS.CAN_DELETE_SUPPLIER(role);

  // Zustand store
  const suppliers = useDataStore(state => state.suppliers);
  const fetchSuppliers = useDataStore(state => state.fetchSuppliers);
  const dataError = useDataStore(state => state.error);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [search, setSearch] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  useEffect(() => {
    if (dataError) showError(dataError);
  }, [dataError, showError]);

  const filtered = suppliers.filter(p =>
    (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
    (p.tax_id && p.tax_id.includes(search)) ||
    (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
    (p.phone && p.phone.includes(search))
  );

  const handleDelete = async (supplier) => {
    if (!canDelete) {
      showWarning(ERRORS.ONLY_SUPER_ADMIN);
      return;
    }
    setSupplierToDelete(supplier);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;

    setLoading(true);
    try {
      const resp = await patchSupplier(supplierToDelete.id, { deleted_at: new Date().toISOString() });
      if (resp.ok) {
        fetchSuppliers();
        showSuccess(SUCCESS.DELETED(ENTITIES.SUPPLIER));
      } else {
        showError(resp.data?.detail || ERRORS.DELETE_FAILED(ENTITIES.SUPPLIER));
      }
    } catch (error) {
      showError(ERRORS.DELETE_FAILED(ENTITIES.SUPPLIER));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="suppliers-page-container">
      <div className="suppliers-header">
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
        {canAdd && (
          <button className="btn-add-supplier" onClick={() => setShowAdd(true)}>
            <FaPlus /> AÑADIR PROVEEDOR
          </button>
        )}
      </div>

      <div className="suppliers-list">
        {filtered.map(supplier => {
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
            <div key={supplier.id} className="supplier-card">
              <div className="supplier-info">
                <div className="supplier-main">
                  <div className="supplier-name">{supplier.name}</div>
                  <div className="supplier-detail">
                    <span className="supplier-label">{getDocumentLabel(supplier.document_type)}</span> {supplier.tax_id || "-"}
                  </div>
                </div>
              <div className="supplier-contact">
                <div className="supplier-detail">
                  <span className="supplier-label">Email:</span> {supplier.email || "-"}
                </div>
                <div className="supplier-detail">
                  <span className="supplier-label">Tel:</span> {supplier.phone || "-"}
                </div>
              </div>
              <div className="supplier-address">
                <span className="supplier-label">Dirección:</span> {supplier.address || "-"}
              </div>
            </div>

            {canEdit && (
              <div className="supplier-actions">
                <button
                  className="btn-icon"
                  onClick={() => { setEditingSupplier(supplier); setShowEdit(true); }}
                >
                  <FaEdit />
                </button>
                {canDelete && (
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(supplier)}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="no-data">No hay proveedores para mostrar.</div>}
      </div>

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <AddSupplierForm
            onSave={() => {
              setShowAdd(false);
              fetchSuppliers();
            }}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}

      {showEdit && editingSupplier && (
        <Modal onClose={() => { setShowEdit(false); setEditingSupplier(null); }}>
          <EditSupplierForm
            supplier={editingSupplier}
            onSave={() => {
              setShowEdit(false);
              setEditingSupplier(null);
              fetchSuppliers();
            }}
            onCancel={() => {
              setShowEdit(false);
              setEditingSupplier(null);
            }}
          />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSupplierToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Proveedor"
        message={CONFIRM.DELETE(ENTITIES.SUPPLIER, supplierToDelete?.name)}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
