// src/pages/InventoryPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import ProductCard from "../components/ProductCard";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import ProductForm from "../components/ProductForm";
import Pagination from "../components/Pagination";
import AdjustmentFormModal from "./TransactionsPage/AdjustmentFormModal";
import MultiSelectDropdown from "../components/MultiSelectDropdown";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import "../styles/pages/InventoryPage.css";

import { patchProductJson } from "../services/api";
import { clearProductCache } from "../hooks/useProductSearch";
import { useMasterDataStore } from "../store/masterDataStore";
import { PERMISSIONS } from "../constants/roles";
import { ERRORS, SUCCESS, ENTITIES, CONFIRM } from "../constants/messages";
import { extractFormErrors } from "../utils/errorHandler";
import { PAGINATION } from "../constants/config";
import { useAdjustmentModal } from "../hooks/useAdjustmentModal";
import { useInventoryProducts } from "../hooks/useInventoryProducts";
import type { Product } from "../types/models";
import type { LayoutContext } from "../types/context";

export default function InventoryPage() {
  const { user } = useOutletContext<LayoutContext>();
  const { showSuccess, showError, showWarning, setLoading } = useApp();
  const role = user?.role || "";

  const canAddProduct = PERMISSIONS.CAN_ADD_PRODUCT(role);
  const canDeleteProduct = PERMISSIONS.CAN_DELETE_PRODUCT(role);
  const canCreateAdjustment = PERMISSIONS.CAN_CREATE_ADJUSTMENT(role);

  const fetchCategories = useMasterDataStore((state) => state.fetchCategories);

  // Hook server-side: gestiona fetch, filtros, paginación y enriquecimiento de nombres.
  const inv = useInventoryProducts();

  const adj = useAdjustmentModal();

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // El evento 'recargarInventario' (disparado por el modal de ajuste) refresca
  // la página actual del inventario.
  useEffect(() => {
    const handleReload = () => { inv.refresh(); };
    window.addEventListener("recargarInventario", handleReload);
    return () => window.removeEventListener("recargarInventario", handleReload);
  }, [inv.refresh]);

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setShowEdit(true);
  }, []);

  const handleDelete = useCallback(
    async (product: Product) => {
      if (!canDeleteProduct) {
        showWarning(ERRORS.ONLY_SUPER_ADMIN);
        return;
      }
      setProductToDelete(product);
      setShowDeleteConfirm(true);
    },
    [canDeleteProduct, showWarning]
  );

  const confirmDelete = useCallback(async () => {
    if (!productToDelete) return;
    setLoading(true);
    try {
      const resp = await patchProductJson(productToDelete.id, {
        deleted_at: new Date().toISOString(),
      });
      if (resp.ok) {
        clearProductCache();
        inv.refresh();
        showSuccess(SUCCESS.DELETED(ENTITIES.PRODUCT));
      } else {
        showError(extractFormErrors(resp.data, ERRORS.DELETE_FAILED(ENTITIES.PRODUCT)));
      }
    } catch {
      showError(ERRORS.DELETE_FAILED(ENTITIES.PRODUCT));
    } finally {
      setLoading(false);
    }
  }, [productToDelete, inv.refresh, setLoading, showSuccess, showError]);

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
            value={inv.search}
            onChange={(e) => inv.setSearch(e.target.value)}
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
          <MultiSelectDropdown
            label="Categoría:"
            controller={inv.categoriesMulti}
            placeholder="Todas las categorías"
            searchPlaceholder="Buscar categoría..."
            emptyMessage="No se encontraron categorías"
          />
        </div>

        <div className="filter-group">
          <MultiSelectDropdown
            label="Proveedor:"
            controller={inv.suppliersMulti}
            placeholder="Todos los proveedores"
            searchPlaceholder="Buscar proveedor..."
            emptyMessage="No se encontraron proveedores"
          />
        </div>

        <div className="filter-group">
          <MultiSelectDropdown
            label="Estado:"
            controller={inv.statusMulti}
            placeholder="Todos los estados"
            searchPlaceholder="Buscar estado..."
            emptyMessage="No se encontraron estados"
          />
        </div>

        <div className="filter-group">
          <label>Ordenar:</label>
          <select value={inv.sort} onChange={(e) => inv.setSort(e.target.value)}>
            <option value="-id">Lo nuevo</option>
            <option value="name">Nombre A → Z</option>
            <option value="-name">Nombre Z → A</option>
            <option value="price">Menor a mayor precio</option>
            <option value="-price">Mayor a menor precio</option>
          </select>
        </div>

        <button className="btn-clear-filters" onClick={inv.clearFilters}>
          Limpiar filtros
        </button>
      </div>

      <div className="product-list">
        {inv.loading && inv.products.length === 0 && (
          <div className="loading-placeholder">Cargando productos...</div>
        )}
        {inv.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isAdmin={canAddProduct}
            canDelete={canDeleteProduct}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {!inv.loading && inv.count === 0 && (
          <div className="no-data">No hay productos para mostrar.</div>
        )}
      </div>

      <Pagination
        currentPage={inv.page}
        totalPages={inv.totalPages}
        onPageChange={inv.setPage}
        totalItems={inv.count}
        pageSize={PAGINATION.DEFAULT_PAGE_SIZE}
      />

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <ProductForm
            onSave={() => {
              setShowAdd(false);
              fetchCategories();
              inv.refresh();
            }}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}

      {showEdit && editingProduct && (
        <Modal
          onClose={() => {
            setShowEdit(false);
            setEditingProduct(null);
          }}
        >
          <ProductForm
            product={editingProduct}
            onSave={() => {
              setShowEdit(false);
              setEditingProduct(null);
              inv.refresh();
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
        message={CONFIRM.DELETE(ENTITIES.PRODUCT, productToDelete?.name ?? "")}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      <AdjustmentFormModal
        show={adj.show}
        onClose={adj.close}
        currentTime={adj.currentTime}
        productDropdown={adj.productDropdown}
        onProductSelect={adj.confirmProductSelection}
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
