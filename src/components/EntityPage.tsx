// components/EntityPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import Pagination from "./Pagination";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { useDataStore, selectFirstError } from "../store/dataStore";
import { ERRORS, SUCCESS, CONFIRM } from "../constants/messages";
import { extractFormErrors } from "../utils/errorHandler";
import { PAGINATION } from "../constants/config";
import { getDocumentLabel } from "../utils/documentLabels";
import type { ApiResponse } from "../types/api";
import type { LayoutContext } from "../types/context";
import "../styles/pages/EntityPage.css";

interface EntityItem {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  document_type?: string;
  [key: string]: unknown;
}

export interface EntityPageConfig {
  title: string;
  entityLabel: string;
  emptyLabel: string;
  searchPlaceholder: string;
  addButtonLabel: string;
  deleteTitle: string;
  storeKey: string;
  fetchKey: string;
  patchFn: (id: number, data: Record<string, unknown>) => Promise<ApiResponse<unknown>>;
  filterFn: (item: EntityItem, search: string) => boolean;
  canAdd: (role: string) => boolean;
  canEdit: (role: string) => boolean;
  canDelete: (role: string) => boolean;
  documentField: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FormComponent: React.ComponentType<any>;
  formEntityProp: string;
}

interface Props {
  config: EntityPageConfig;
}

export default function EntityPage({ config }: Props) {
  const { user } = useOutletContext<LayoutContext>();
  const { showSuccess, showError, showWarning, setLoading } = useApp();
  const role = user?.role || "";

  const canAdd = config.canAdd(role);
  const canEdit = config.canEdit(role);
  const canDelete = config.canDelete(role);

  // Access store dynamically — cast to avoid TypeScript index signature errors
  const items = useDataStore(
    (state) => ((state as unknown as Record<string, EntityItem[]>)[config.storeKey] ?? [])
  );
  const fetchItems = useDataStore(
    (state) => (state as unknown as Record<string, () => void>)[config.fetchKey]
  );
  const dataError = useDataStore(selectFirstError);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingItem, setEditingItem] = useState<EntityItem | null>(null);
  const [search, setSearch] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EntityItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (dataError) showError(dataError);
  }, [dataError, showError]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = useMemo(
    () => items.filter(item => config.filterFn(item, search)),
    [items, search, config]
  );

  const totalPages = Math.ceil(filtered.length / PAGINATION.DEFAULT_PAGE_SIZE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGINATION.DEFAULT_PAGE_SIZE;
    return filtered.slice(start, start + PAGINATION.DEFAULT_PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleDelete = useCallback((item: EntityItem) => {
    if (!canDelete) {
      showWarning(ERRORS.ONLY_SUPER_ADMIN);
      return;
    }
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  }, [canDelete, showWarning]);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    setLoading(true);
    try {
      const resp = await config.patchFn(itemToDelete.id, { deleted_at: new Date().toISOString() });
      if (resp.ok) {
        fetchItems();
        showSuccess(SUCCESS.DELETED(config.entityLabel));
      } else {
        showError(extractFormErrors(resp.data, ERRORS.DELETE_FAILED(config.entityLabel)));
      }
    } catch {
      showError(ERRORS.DELETE_FAILED(config.entityLabel));
    } finally {
      setLoading(false);
    }
  }, [itemToDelete, config, fetchItems, setLoading, showSuccess, showError]);

  const FormComponent = config.FormComponent;

  return (
    <div className="entity-page-container">
      <div className="entity-header">
        <h2>{config.title}</h2>
      </div>

      <div className="entity-actions">
        <div className="entity-search-bar">
          <Search size={16} />
          <input
            placeholder={config.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {canAdd && (
          <button className="btn-add-entity" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> {config.addButtonLabel}
          </button>
        )}
      </div>

      <div className="entity-list">
        {paginatedItems.map(item => (
          <div key={item.id} className="entity-card">
            <div className="entity-info">
              <div className="entity-main">
                <div className="entity-name">{item.name || "-"}</div>
                <div className="entity-detail">
                  <span className="entity-label">{getDocumentLabel(item.document_type ?? '')}:</span>{" "}
                  {String(item[config.documentField] ?? "-")}
                </div>
              </div>
              <div className="entity-contact">
                <div className="entity-detail">
                  <span className="entity-label">Email:</span> {item.email || "-"}
                </div>
                <div className="entity-detail">
                  <span className="entity-label">Tel:</span> {item.phone || "-"}
                </div>
              </div>
              <div className="entity-address">
                <span className="entity-label">Dirección:</span> {item.address || "-"}
              </div>
            </div>

            {(canEdit || canDelete) && (
              <div className="entity-card-actions">
                {canEdit && (
                  <button
                    className="btn-icon"
                    onClick={() => { setEditingItem(item); setShowEdit(true); }}
                  >
                    <Pencil size={16} />
                  </button>
                )}
                {canDelete && (
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="entity-no-data">No hay {config.emptyLabel} para mostrar.</div>
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
          <FormComponent
            onSave={() => { setShowAdd(false); fetchItems(); }}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}

      {showEdit && editingItem && (
        <Modal onClose={() => { setShowEdit(false); setEditingItem(null); }}>
          <FormComponent
            {...{ [config.formEntityProp]: editingItem }}
            onSave={() => { setShowEdit(false); setEditingItem(null); fetchItems(); }}
            onCancel={() => { setShowEdit(false); setEditingItem(null); }}
          />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setItemToDelete(null); }}
        onConfirm={confirmDelete}
        title={config.deleteTitle}
        message={CONFIRM.DELETE(config.entityLabel, itemToDelete?.name ?? '')}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
