// src/pages/InventoryPage.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import ProductCard from "../components/ProductCard";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import AddProductForm from "../components/AddProductForm";
import EditProductForm from "../components/EditProductForm";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useApp } from "../contexts/AppContext";
import "../styles/pages/InventoryPage.css";

import { patchProductJson } from "../services/api";
import { useDataStore } from "../store/dataStore";
import { PERMISSIONS } from "../constants/roles";
import { ERRORS, SUCCESS, ENTITIES, CONFIRM } from "../constants/messages";

export default function InventoryPage({ user }) {
  const { showSuccess, showError, showWarning, setLoading } = useApp();
  const currentUser = user || JSON.parse(localStorage.getItem("user"));
  const role = currentUser?.role || "";

  // Permisos basados en rol (usando constantes centralizadas)
  const canAddProduct = PERMISSIONS.CAN_ADD_PRODUCT(role);
  const canDeleteProduct = PERMISSIONS.CAN_DELETE_PRODUCT(role);

  // Zustand store - estado centralizado
  const products = useDataStore(state => state.products);
  const suppliers = useDataStore(state => state.suppliers);
  const categories = useDataStore(state => state.categories);
  const fetchProducts = useDataStore(state => state.fetchProducts);
  const fetchCategories = useDataStore(state => state.fetchCategories);
  const dataError = useDataStore(state => state.error);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    if (dataError) showError(dataError);
  }, [dataError, showError]);

  useEffect(() => {
    const handleReload = () => fetchProducts();
    window.addEventListener("recargarInventario", handleReload);
    return () => window.removeEventListener("recargarInventario", handleReload);
  }, [fetchProducts]);

  // ✅ Optimización: useMemo para evitar recalcular en cada render
  const productsWithNames = useMemo(() => {
    return products.map((p) => {
      const cat = categories.find((c) => c.id === p.category);
      const prov = suppliers.find((s) => s.id === p.supplier);
      return {
        ...p,
        category_name: cat ? cat.name : "-",
        supplier_name: prov ? prov.name : "-",
      };
    });
  }, [products, categories, suppliers]);

  // ✅ Optimización: useMemo para filtrado - solo recalcula cuando cambian las dependencias
  const filtered = useMemo(() => {
    return productsWithNames.filter((p) => {
      // Filtro de búsqueda por texto
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category_name && p.category_name.toLowerCase().includes(search.toLowerCase())) ||
        (p.supplier_name && p.supplier_name.toLowerCase().includes(search.toLowerCase()));

      // Filtro por categoría
      const matchesCategory = !filterCategory || p.category === parseInt(filterCategory);

      // Filtro por proveedor
      const matchesSupplier = !filterSupplier || p.supplier === parseInt(filterSupplier);

      // Filtro por estado
      const matchesStatus = !filterStatus ||
        (filterStatus === "active" && p.is_active) ||
        (filterStatus === "inactive" && !p.is_active);

      return matchesSearch && matchesCategory && matchesSupplier && matchesStatus;
    });
  }, [productsWithNames, search, filterCategory, filterSupplier, filterStatus]);

  // ✅ Optimización: useCallback para evitar recrear la función en cada render
  const handleDelete = useCallback(async (product) => {
    if (!canDeleteProduct) {
      showWarning(ERRORS.ONLY_SUPER_ADMIN);
      return;
    }
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  }, [canDeleteProduct, showWarning]);

  // ✅ Optimización: useCallback para confirmDelete
  const confirmDelete = useCallback(async () => {
    if (!productToDelete) return;

    setLoading(true);
    try {
      const resp = await patchProductJson(productToDelete.id, { deleted_at: new Date().toISOString() });
      if (resp.ok) {
        fetchProducts();
        showSuccess(SUCCESS.DELETED(ENTITIES.PRODUCT));
      } else {
        showError(resp.data?.detail || ERRORS.DELETE_FAILED(ENTITIES.PRODUCT));
      }
    } catch (error) {
      showError(ERRORS.DELETE_FAILED(ENTITIES.PRODUCT));
    } finally {
      setLoading(false);
    }
  }, [productToDelete, fetchProducts, setLoading, showSuccess, showError]);

  return (
    <div className="inventory-page-container">
      <div className="inventory-header">
        <h2>INVENTARIO</h2>
      </div>

      <div className="inventory-actions">
        <div className="inventory-search-bar">
          <FaSearch />
          <input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canAddProduct && (
          <button className="btn-add-product" onClick={() => setShowAdd(true)}>
            <FaPlus /> AÑADIR PRODUCTO
          </button>
        )}
      </div>

      <div className="inventory-filters">
        <div className="filter-group">
          <label>Categoría:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Proveedor:</label>
          <select
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
          >
            <option value="">Todos los proveedores</option>
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Estado:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>

        <button
          className="btn-clear-filters"
          onClick={() => {
            setFilterCategory("");
            setFilterSupplier("");
            setFilterStatus("");
            setSearch("");
          }}
        >
          Limpiar filtros
        </button>
      </div>

      <div className="product-list">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isAdmin={canAddProduct}
            canDelete={canDeleteProduct}
            onEdit={(p) => {
              setEditingProduct(p);
              setShowEdit(true);
            }}
            onDelete={(p) => handleDelete(p)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="no-data">No hay productos para mostrar.</div>
        )}
      </div>

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <AddProductForm
            onSave={() => {
              setShowAdd(false);
              fetchProducts();
              fetchCategories();
            }}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}

      {showEdit && editingProduct && (
        <Modal onClose={() => {
          setShowEdit(false);
          setEditingProduct(null);
        }}>
          <EditProductForm
            product={editingProduct}
            onSave={() => {
              setShowEdit(false);
              setEditingProduct(null);
              fetchProducts();
            }}
            onCancel={() => {
              setShowEdit(false);
              setEditingProduct(null);
            }}
          />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setProductToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        message={CONFIRM.DELETE(ENTITIES.PRODUCT, productToDelete?.name)}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
