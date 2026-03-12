// components/EntityPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import Pagination from "./Pagination";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { usePagination } from "../hooks/usePagination";
import { ERRORS, SUCCESS, CONFIRM } from "../constants/messages";
import { extractFormErrors } from "../utils/errorHandler";
import { getDocumentLabel } from "../utils/documentLabels";
import type { ApiResponse } from "../types/api";
import type { PaginationData } from "../hooks/usePagination";
import type { LayoutContext } from "../types/context";
import "../styles/pages/EntityPage.css";

export interface EntityItem {
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
  /** Fetch server-side: recibe page, término de búsqueda y ordenamiento */
  fetchFn: (page: number, search: string, ordering: string) => Promise<ApiResponse<unknown>>;
  patchFn: (id: number, data: Record<string, unknown>) => Promise<ApiResponse<unknown>>;
  canAdd: (role: string) => boolean;
  canEdit: (role: string) => boolean;
  canDelete: (role: string) => boolean;
  documentField: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FormComponent: React.ComponentType<any>;
  formEntityProp: string;
  /**
   * Render personalizado del cuerpo del card.
   * Si no se provee, usa el layout de contacto por defecto (email, tel, dirección).
   * Útil para entidades simples como categorías que solo tienen nombre.
   */
  renderDetails?: (item: EntityItem) => React.ReactNode;
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

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingItem, setEditingItem] = useState<EntityItem | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("-id");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EntityItem | null>(null);

  // Debounce: esperar 300 ms tras el último tecleo antes de buscar
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Cuando debouncedSearch o sort cambia → fetchFn cambia → usePagination auto-refetch página 1
  const fetchFn = useCallback(
    (page: number) =>
      config.fetchFn(page, debouncedSearch, sort) as unknown as Promise<ApiResponse<PaginationData<EntityItem>>>,
    [config.fetchFn, debouncedSearch, sort]
  );

  const { data, currentPage, totalPages, totalItems, pageSize, loading, error, isEmpty, goToPage, refresh } =
    usePagination<EntityItem>(fetchFn);

  useEffect(() => {
    if (error) showError(error);
  }, [error, showError]);

  const handleDelete = useCallback(
    (item: EntityItem) => {
      if (!canDelete) {
        showWarning(ERRORS.ONLY_SUPER_ADMIN);
        return;
      }
      setItemToDelete(item);
      setShowDeleteConfirm(true);
    },
    [canDelete, showWarning]
  );

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    setLoading(true);
    try {
      const resp = await config.patchFn(itemToDelete.id, { deleted_at: new Date().toISOString() });
      if (resp.ok) {
        refresh();
        showSuccess(SUCCESS.DELETED(config.entityLabel));
      } else {
        showError(extractFormErrors(resp.data, ERRORS.DELETE_FAILED(config.entityLabel)));
      }
    } catch {
      showError(ERRORS.DELETE_FAILED(config.entityLabel));
    } finally {
      setLoading(false);
    }
  }, [itemToDelete, config, refresh, setLoading, showSuccess, showError]);

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

      <div className="entity-sort">
        <label>Ordenar:</label>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="-id">Lo nuevo</option>
          <option value="name">Nombre A → Z</option>
          <option value="-name">Nombre Z → A</option>
        </select>
      </div>

      <div className="entity-list">
        {data.map(item => (
          <div key={item.id} className="entity-card">
            <div className="entity-info">
              {config.renderDetails ? config.renderDetails(item) : (
                <>
                  <div className="entity-main">
                    <div className="entity-name">{item.name || "-"}</div>
                    <div className="entity-detail">
                      <span className="entity-label">{getDocumentLabel(item.document_type ?? "")}:</span>{" "}
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
                </>
              )}
            </div>

            {(canEdit || canDelete) && (
              <div className="entity-card-actions">
                {canEdit && (
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setEditingItem(item);
                      setShowEdit(true);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                )}
                {canDelete && (
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(item)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && data.length === 0 && (
          <div className="entity-no-data">Cargando {config.emptyLabel}...</div>
        )}
        {!loading && isEmpty && (
          <div className="entity-no-data">No hay {config.emptyLabel} para mostrar.</div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        totalItems={totalItems}
        pageSize={pageSize}
      />

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <FormComponent
            onSave={() => {
              setShowAdd(false);
              refresh();
            }}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}

      {showEdit && editingItem && (
        <Modal
          onClose={() => {
            setShowEdit(false);
            setEditingItem(null);
          }}
        >
          <FormComponent
            {...{ [config.formEntityProp]: editingItem }}
            onSave={() => {
              setShowEdit(false);
              setEditingItem(null);
              refresh();
            }}
            onCancel={() => {
              setShowEdit(false);
              setEditingItem(null);
            }}
          />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={config.deleteTitle}
        message={CONFIRM.DELETE(config.entityLabel, itemToDelete?.name ?? "")}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
