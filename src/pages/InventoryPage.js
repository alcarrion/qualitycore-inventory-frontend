// src/pages/InventoryPage.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import ProductCard from "../components/ProductCard";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import ProductForm from "../components/ProductForm";
import Pagination from "../components/Pagination";
import AdjustmentFormModal from "./TransactionsPage/AdjustmentFormModal";
import SearchableDropdown from "../components/SearchableDropdown";
import { useDropdownSearch } from "../hooks/useDropdownSearch";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import "../styles/pages/InventoryPage.css";

import { patchProductJson } from "../services/api";
import { useDataStore, selectFirstError } from "../store/dataStore";
import { PERMISSIONS } from "../constants/roles";
import { ERRORS, SUCCESS, ENTITIES, CONFIRM } from "../constants/messages";
import { extractFormErrors } from "../utils/errorHandler";
import { PAGINATION } from "../constants/config";
import { useAdjustmentModal } from "../hooks/useAdjustmentModal";

export default function InventoryPage() {
  const { user } = useOutletContext();
  const { showSuccess, showError, showWarning, setLoading } = useApp();
  const role = user?.role || "";

  const canAddProduct = PERMISSIONS.CAN_ADD_PRODUCT(role);
  const canDeleteProduct = PERMISSIONS.CAN_DELETE_PRODUCT(role);
  const canCreateAdjustment = PERMISSIONS.CAN_CREATE_ADJUSTMENT(role);

  const products = useDataStore(state => state.products);
  const suppliers = useDataStore(state => state.suppliers);
  const categories = useDataStore(state => state.categories);
  const fetchProducts = useDataStore(state => state.fetchProducts);
  const fetchCategories = useDataStore(state => state.fetchCategories);
  const dataError = useDataStore(selectFirstError);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const STATUS_OPTIONS = useMemo(() => [
    { id: "active", name: "Activo" },
    { id: "inactive", name: "Inactivo" },
  ], []);

  const categoryDropdown = useDropdownSearch(categories);
  const supplierDropdown = useDropdownSearch(suppliers);
  const statusDropdown = useDropdownSearch(STATUS_OPTIONS);

  const adj = useAdjustmentModal();

  useEffect(() => {
    if (dataError) showError(dataError);
  }, [dataError, showError]);

  useEffect(() => {
    const handleReload = () => fetchProducts();
    window.addEventListener("recargarInventario", handleReload);
    return () => window.removeEventListener("recargarInventario", handleReload);
  }, [fetchProducts]);

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

  const filtered = useMemo(() => {
    return productsWithNames.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category_name && p.category_name.toLowerCase().includes(search.toLowerCase())) ||
        (p.supplier_name && p.supplier_name.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = !filterCategory || p.category === parseInt(filterCategory);
      const matchesSupplier = !filterSupplier || p.supplier === parseInt(filterSupplier);
      const matchesStatus = !filterStatus ||
        (filterStatus === "active" && p.is_active) ||
        (filterStatus === "inactive" && !p.is_active);
      return matchesSearch && matchesCategory && matchesSupplier && matchesStatus;
    });
  }, [productsWithNames, search, filterCategory, filterSupplier, filterStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCategory, filterSupplier, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PAGINATION.DEFAULT_PAGE_SIZE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGINATION.DEFAULT_PAGE_SIZE;
    return filtered.slice(startIndex, startIndex + PAGINATION.DEFAULT_PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleEdit = useCallback((product) => {
    setEditingProduct(product);
    setShowEdit(true);
  }, []);

  const handleDelete = useCallback(async (product) => {
    if (!canDeleteProduct) {
      showWarning(ERRORS.ONLY_SUPER_ADMIN);
      return;
    }
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  }, [canDeleteProduct, showWarning]);

  const confirmDelete = useCallback(async () => {
    if (!productToDelete) return;

    setLoading(true);
    try {
      const resp = await patchProductJson(productToDelete.id, { deleted_at: new Date().toISOString() });
      if (resp.ok) {
        fetchProducts();
        showSuccess(SUCCESS.DELETED(ENTITIES.PRODUCT));
      } else {
        showError(extractFormErrors(resp.data, ERRORS.DELETE_FAILED(ENTITIES.PRODUCT)));
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
          <Search size={16} />
          <input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="inventory-action-buttons">
          {canCreateAdjustment && (
            <button className="btn-adjust-inventory" onClick={adj.open}>
              <SlidersHorizontal size={16} /> AJUSTAR INVENTARIO
            </button>
          )}
          {canAddProduct && (
            <button className="btn-add-product" onClick={() => setShowAdd(true)}>
              <Plus size={16} /> AÑADIR PRODUCTO
            </button>
          )}
        </div>
      </div>

      <div className="inventory-filters">
        <div className="filter-group">
          <SearchableDropdown
            label="Categoría:"
            dropdown={categoryDropdown}
            otherDropdowns={[supplierDropdown, statusDropdown]}
            onSelect={(item) => {
              categoryDropdown.select(item.name);
              setFilterCategory(String(item.id));
            }}
            onDeselect={() => setFilterCategory("")}
            placeholder="Todas las categorías"
            emptyMessage="No se encontraron categorías"
          />
        </div>

        <div className="filter-group">
          <SearchableDropdown
            label="Proveedor:"
            dropdown={supplierDropdown}
            otherDropdowns={[categoryDropdown, statusDropdown]}
            onSelect={(item) => {
              supplierDropdown.select(item.name);
              setFilterSupplier(String(item.id));
            }}
            onDeselect={() => setFilterSupplier("")}
            placeholder="Todos los proveedores"
            emptyMessage="No se encontraron proveedores"
          />
        </div>

        <div className="filter-group">
          <SearchableDropdown
            label="Estado:"
            dropdown={statusDropdown}
            otherDropdowns={[categoryDropdown, supplierDropdown]}
            onSelect={(item) => {
              statusDropdown.select(item.name);
              setFilterStatus(item.id);
            }}
            onDeselect={() => setFilterStatus("")}
            placeholder="Todos los estados"
            emptyMessage="No se encontraron estados"
          />
        </div>

        <button
          className="btn-clear-filters"
          onClick={() => {
            setFilterCategory("");
            setFilterSupplier("");
            setFilterStatus("");
            setSearch("");
            categoryDropdown.clear();
            supplierDropdown.clear();
            statusDropdown.clear();
          }}
        >
          Limpiar filtros
        </button>
      </div>

      <div className="product-list">
        {paginatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isAdmin={canAddProduct}
            canDelete={canDeleteProduct}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {filtered.length === 0 && (
          <div className="no-data">No hay productos para mostrar.</div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filtered.length}
        pageSize={PAGINATION.DEFAULT_PAGE_SIZE}
      />

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <ProductForm
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
          <ProductForm
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

      {/* Modal de ajuste de inventario */}
      <AdjustmentFormModal
        show={adj.show}
        onClose={adj.close}
        currentTime={adj.currentTime}
        productSearch={adj.productSearch}
        onProductSearchChange={adj.setProductSearch}
        showProductDropdown={adj.showDropdown}
        onShowProductDropdownChange={adj.setShowDropdown}
        onProductSelect={adj.selectProduct}
        filteredProducts={adj.filteredProducts}
        selectedProduct={adj.selectedProduct}
        quantity={adj.quantity}
        onQuantityChange={(e) => adj.setQuantity(e.target.value)}
        reason={adj.reason}
        onReasonChange={(e) => adj.setReason(e.target.value)}
        onWheel={adj.handleWheel}
        onSubmit={adj.handleSubmit}
        isSubmitting={adj.isSubmitting}
      />
    </div>
  );
}
