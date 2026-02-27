// src/components/ProductForm.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  getSuppliers,
  getCategories,
  postCategory,
  postProduct,
  patchProduct,
} from "../services/api";
import SearchableDropdown from "./SearchableDropdown";
import { useDropdownSearch } from "../hooks/useDropdownSearch";
import { useAbortSignal } from "../hooks/useAbortSignal";
import { useApp } from "../contexts/AppContext";
import { validateImage } from "../utils/validateImage";
import { ERRORS, SUCCESS, ENTITIES } from "../constants/messages";
import type { Product, Category, Supplier } from "../types/models";
import "../styles/components/Form.css";

interface StatusOption {
  id: string;
  name: string;
}

interface Props {
  product?: Product | null;
  onSave?: (data: unknown) => void;
  onCancel?: () => void;
}

export default function ProductForm({ product = null, onSave, onCancel }: Props) {
  const isEditing = !!product;
  const { showSuccess, showError } = useApp();

  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [category, setCategory] = useState(product ? String(product.category || "") : "");
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [supplier, setSupplier] = useState(product ? String(
    typeof product.supplier === 'number' ? product.supplier : (product.supplier as Supplier)?.id || ""
  ) : "");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [price, setPrice] = useState<string | number>(product?.price || "");
  const [minimumStock, setMinimumStock] = useState<string | number>(product?.minimum_stock ?? "");
  const [status, setStatus] = useState(product?.status || "Activo");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const getSignal = useAbortSignal();

  const STATUS_OPTIONS = useMemo((): StatusOption[] => [
    { id: "Activo", name: "Activo" },
    { id: "Inactivo", name: "Inactivo" },
  ], []);

  const categoryDropdown = useDropdownSearch<Category>(categories);
  const supplierDropdown = useDropdownSearch<Supplier>(suppliers);
  const statusDropdown = useDropdownSearch<StatusOption>(STATUS_OPTIONS);

  // Solo para modo edición
  const currentStock = product?.current_stock ?? product?.stock;
  const currentImageUrl = product?.image_url ?? product?.image;

  useEffect(() => {
    const signal = getSignal();
    (async () => {
      const ps = await getSuppliers(null, { signal });
      if ((ps as { aborted?: boolean }).aborted) return;
      const suppliersList = (ps.data as { results?: Supplier[] } | null)?.results ?? (Array.isArray(ps.data) ? ps.data as Supplier[] : []);
      const filteredSuppliers = suppliersList.filter(p => !p.deleted_at);
      setSuppliers(filteredSuppliers);

      const cs = await getCategories(null, { signal });
      if ((cs as { aborted?: boolean }).aborted) return;
      const categoriesList = (cs.data as { results?: Category[] } | null)?.results ?? (Array.isArray(cs.data) ? cs.data as Category[] : []);
      setCategories(categoriesList);

      if (isEditing) {
        const supplierId = typeof product?.supplier === 'number' ? product.supplier : (product?.supplier as Supplier)?.id;
        if (supplierId) {
          const sup = filteredSuppliers.find(s => s.id === supplierId);
          if (sup) supplierDropdown.select(sup.name);
        }
        const categoryId = typeof product?.category === 'number' ? product.category : (product?.category as Category | null)?.id;
        if (categoryId) {
          const cat = categoriesList.find(c => c.id === categoryId);
          if (cat) categoryDropdown.select(cat.name);
        }
      }
    })();
    if (status) {
      const opt = STATUS_OPTIONS.find(o => o.id === status);
      if (opt) statusDropdown.select(opt.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValid = await validateImage(file, showError);
    if (isValid) {
      setImage(file);
    } else {
      e.target.value = '';
      setImage(null);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    (e.target as HTMLInputElement).blur();
  };

  const handleNewCategory = async () => {
    if (!newCategory.trim()) return;
    setLoading(true);
    try {
      const res = await postCategory(newCategory.trim());
      if (!res.ok) {
        showError((res.data as { detail?: string } | null)?.detail || ERRORS.CREATE_FAILED(ENTITIES.CATEGORY));
        setLoading(false);
        return;
      }
      const cat = res.data as Category;
      setCategories(prev => [...prev, cat]);
      setCategory(String(cat.id));
      categoryDropdown.select(cat.name);
      setNewCategory("");
      showSuccess(SUCCESS.CREATED('Categoría'));
    } catch (e) {
      showError((e as Error).message || ERRORS.CREATE_FAILED(ENTITIES.CATEGORY));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !price || !minimumStock || !category || !supplier) {
      showError(ERRORS.REQUIRED_FIELDS);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    if (description) formData.append("description", description);
    formData.append("category", String(category));
    formData.append("price", String(price));
    formData.append("minimum_stock", String(minimumStock));
    formData.append("status", status);
    formData.append("supplier", String(supplier));
    if (image) formData.append("image", image);

    try {
      const res = isEditing
        ? await patchProduct(product!.id, formData)
        : await postProduct(formData);

      if (!res.ok) {
        if (res.data && typeof res.data === 'object' && !(res.data as { detail?: string }).detail) {
          const errorMessages = Object.entries(res.data as unknown as Record<string, unknown>)
            .map(([, messages]) => {
              if (Array.isArray(messages)) return messages.join(', ');
              return String(messages);
            })
            .join('. ');
          const errorMsg = isEditing
            ? ERRORS.UPDATE_FAILED(ENTITIES.PRODUCT)
            : ERRORS.CREATE_FAILED(ENTITIES.PRODUCT);
          showError(errorMessages || errorMsg);
        } else {
          const errorMsg = isEditing
            ? ERRORS.UPDATE_FAILED(ENTITIES.PRODUCT)
            : ERRORS.CREATE_FAILED(ENTITIES.PRODUCT);
          showError((res.data as { detail?: string } | null)?.detail || errorMsg);
        }
        setLoading(false);
        return;
      }

      showSuccess(isEditing ? SUCCESS.UPDATED('Producto') : SUCCESS.CREATED('Producto'));
      onSave?.(res.data);
    } catch (e) {
      const errorMsg = isEditing
        ? ERRORS.UPDATE_FAILED(ENTITIES.PRODUCT)
        : ERRORS.CREATE_FAILED(ENTITIES.PRODUCT);
      showError((e as Error).message || errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="form-title">
        {isEditing ? "Editar producto" : "Añadir producto"}
      </div>

      <div className="form-group">
        <label>Nombre *</label>
        <input value={name} onChange={e => setName(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Descripción</label>
        <input value={description} onChange={e => setDescription(e.target.value)} />
      </div>

      <div className="form-group">
        <SearchableDropdown
          label="Categoría *"
          dropdown={categoryDropdown}
          otherDropdowns={[supplierDropdown, statusDropdown]}
          onSelect={(item) => {
            categoryDropdown.select(item.name);
            setCategory(String(item.id));
          }}
          onDeselect={() => setCategory("")}
          placeholder="Buscar categoría..."
          emptyMessage="No se encontraron categorías"
          className="form-sd"
        />
        <div className="form-inline-row">
          <input
            placeholder="Nueva categoría"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
          />
          <button type="button" onClick={handleNewCategory} disabled={loading || !newCategory}>
            Añadir
          </button>
        </div>
      </div>

      <div className="form-group">
        <SearchableDropdown
          label="Proveedor *"
          dropdown={supplierDropdown}
          otherDropdowns={[categoryDropdown, statusDropdown]}
          onSelect={(item) => {
            supplierDropdown.select(item.name);
            setSupplier(String(item.id));
          }}
          onDeselect={() => setSupplier("")}
          placeholder="Buscar proveedor..."
          emptyMessage="No se encontraron proveedores"
          className="form-sd"
        />
      </div>

      <div className="form-group">
        <label>Precio *</label>
        <input
          type="number"
          min={0}
          value={price}
          onChange={e => setPrice(e.target.value)}
          onWheel={handleWheel}
          required
        />
      </div>

      {isEditing && (
        <div className="form-group">
          <label>Stock actual</label>
          <input type="number" value={currentStock ?? 0} disabled />
        </div>
      )}

      <div className="form-group">
        <label>Stock mínimo *</label>
        <input
          type="number"
          min={0}
          value={minimumStock}
          onChange={e => setMinimumStock(e.target.value)}
          onWheel={handleWheel}
          required
        />
      </div>

      <div className="form-group">
        <SearchableDropdown
          label="Estado *"
          dropdown={statusDropdown}
          otherDropdowns={[categoryDropdown, supplierDropdown]}
          onSelect={(item) => {
            statusDropdown.select(item.name);
            setStatus(item.id);
          }}
          onDeselect={() => setStatus("")}
          placeholder="Seleccionar estado..."
          emptyMessage="No se encontraron estados"
          className="form-sd"
        />
      </div>

      <div className="form-group">
        <label>Imagen</label>
        {isEditing && currentImageUrl && currentImageUrl.trim() !== '' && (
          <div className="form-image-preview">
            <div className="form-image-preview-card">
              <img
                src={currentImageUrl}
                alt="Imagen actual"
                className="form-image-preview-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="form-image-preview-info">
                <div className="form-image-preview-label">Imagen actual</div>
                <div className="form-image-preview-filename">
                  {currentImageUrl.includes('/') ? currentImageUrl.split('/').pop() : currentImageUrl}
                </div>
              </div>
            </div>
          </div>
        )}
        <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileChange} />
        <small className="form-hint">
          {isEditing && currentImageUrl && currentImageUrl.trim() !== '' ? 'Selecciona una nueva imagen para reemplazar la actual. ' : ''}
          Formatos: JPG, PNG. Tamaño máximo: 2MB. Dimensiones: 300x300px a 2000x2000px.
        </small>
      </div>

      <div className="form-actions">
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Guardando..." : isEditing ? "Guardar" : "Añadir"}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
