// src/pages/SuppliersPage.js
import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import AddSupplierForm from "../components/AddSupplierForm";
import EditSupplierForm from "../components/EditSupplierForm";
import { useApp } from "../contexts/AppContext";
import "../styles/pages/SuppliersPage.css";

// ✅ wrappers del servicio
import { getSuppliers, patchSupplier } from "../services/api";

export default function SuppliersPage({ user }) {
  const { showSuccess, showError, showWarning, setLoading } = useApp();
  const currentUser = user || JSON.parse(localStorage.getItem("user"));
  const [suppliers, setSuppliers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [search, setSearch] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const role = (currentUser?.role || "").toLowerCase();
  const isAdmin = role === "administrator" || role === "superadmin" || role === "super administrador";
  const isSuperAdmin = role === "superadmin" || role === "super administrador";

  const loadSuppliers = async () => {
    try {
      const res = await getSuppliers();
      // El backend devuelve paginación: { count, next, previous, results: [...] }
      // Extraemos el array de proveedores desde "results"
      const list = res.data?.results || res.data || [];
      const suppliers = Array.isArray(list) ? list : [];
      setSuppliers(suppliers.filter(p => !p.deleted_at));
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      showError("Error al cargar la lista de proveedores. Por favor, intenta nuevamente.");
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [showAdd, showEdit]);

  const filtered = suppliers.filter(p =>
    (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
    (p.tax_id && p.tax_id.includes(search)) ||
    (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
    (p.phone && p.phone.includes(search))
  );

  const handleDelete = async (supplier) => {
    if (!isSuperAdmin) {
      showWarning("Solo los Super Administradores pueden eliminar proveedores.");
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
        setSuppliers(prev => prev.filter(p => p.id !== supplierToDelete.id));
        showSuccess("Proveedor eliminado correctamente.");
      } else {
        showError(resp.data?.detail || "No se pudo eliminar el proveedor.");
      }
    } catch (error) {
      showError("Error al eliminar el proveedor.");
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
        {isAdmin && (
          <button className="btn-add-supplier" onClick={() => setShowAdd(true)}>
            <FaPlus /> AÑADIR PROVEEDOR
          </button>
        )}
      </div>

      <div className="suppliers-list">
        {filtered.map(supplier => {
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

            {isAdmin && (
              <div className="supplier-actions">
                <button
                  className="btn-icon"
                  onClick={() => { setEditingSupplier(supplier); setShowEdit(true); }}
                >
                  <FaEdit />
                </button>
                {isSuperAdmin && (
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
            onSave={() => setShowAdd(false)}
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
        message={`¿Estás seguro de que deseas eliminar al proveedor "${supplierToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
