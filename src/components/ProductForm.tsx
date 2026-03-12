// src/components/ProductForm.tsx
// Componente de formulario para crear/editar productos.
// Solo contiene JSX — la lógica vive en useProductDropdowns y useProductForm.
import React from "react";
import SearchableDropdown from "./SearchableDropdown";
import { useProductDropdowns } from "../hooks/useProductDropdowns";
import { useProductForm } from "../hooks/useProductForm";
import type { Product } from "../types/models";
import "../styles/components/Form.css";

interface Props {
  product?: Product | null;
  onSave?: (data: unknown) => void;
  onCancel?: () => void;
}

export default function ProductForm({ product = null, onSave, onCancel }: Props) {
  const dropdowns = useProductDropdowns(product);
  const form = useProductForm(product, onSave ?? (() => {}));

  const isEditing = !!product;
  const currentStock = product?.current_stock ?? product?.stock;
  const currentImageUrl = product?.image_url ?? product?.image;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.submit(dropdowns.categoryId, dropdowns.supplierId, dropdowns.statusValue);
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="form-title">
        {isEditing ? "Editar producto" : "Añadir producto"}
      </div>

      <div className="form-group">
        <label>Nombre *</label>
        <input value={form.name} onChange={e => form.setName(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Descripción</label>
        <input value={form.description} onChange={e => form.setDescription(e.target.value)} />
      </div>

      <div className="form-group">
        <SearchableDropdown
          label="Categoría *"
          dropdown={dropdowns.categoryDropdown}
          otherDropdowns={[dropdowns.supplierDropdown, dropdowns.statusDropdown]}
          onSelect={(item) => {
            dropdowns.categoryDropdown.select(item.name);
            dropdowns.setCategoryId(String(item.id));
          }}
          onDeselect={() => dropdowns.setCategoryId("")}
          placeholder="Buscar categoría..."
          emptyMessage="No se encontraron categorías"
          className="form-sd"
        />
      </div>

      <div className="form-group">
        <SearchableDropdown
          label="Proveedor *"
          dropdown={dropdowns.supplierDropdown}
          otherDropdowns={[dropdowns.categoryDropdown, dropdowns.statusDropdown]}
          onSelect={(item) => {
            dropdowns.supplierDropdown.select(item.name);
            dropdowns.setSupplierId(String(item.id));
          }}
          onDeselect={() => dropdowns.setSupplierId("")}
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
          value={form.price}
          onChange={e => form.setPrice(e.target.value)}
          onWheel={form.handleWheel}
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
          value={form.minimumStock}
          onChange={e => form.setMinimumStock(e.target.value)}
          onWheel={form.handleWheel}
          required
        />
      </div>

      <div className="form-group">
        <SearchableDropdown
          label="Estado *"
          dropdown={dropdowns.statusDropdown}
          otherDropdowns={[dropdowns.categoryDropdown, dropdowns.supplierDropdown]}
          onSelect={(item) => {
            dropdowns.statusDropdown.select(item.name);
            dropdowns.setStatusValue(item.id as string);
          }}
          onDeselect={() => dropdowns.setStatusValue("")}
          placeholder="Seleccionar estado..."
          emptyMessage="No se encontraron estados"
          className="form-sd"
        />
      </div>

      <div className="form-group">
        <label>Imagen</label>
        {isEditing && currentImageUrl && currentImageUrl.trim() !== "" && (
          <div className="form-image-preview">
            <div className="form-image-preview-card">
              <img
                src={currentImageUrl}
                alt="Imagen actual"
                className="form-image-preview-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="form-image-preview-info">
                <div className="form-image-preview-label">Imagen actual</div>
                <div className="form-image-preview-filename">
                  {currentImageUrl.includes("/")
                    ? currentImageUrl.split("/").pop()
                    : currentImageUrl}
                </div>
              </div>
            </div>
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={form.handleFileChange}
        />
        <small className="form-hint">
          {isEditing && currentImageUrl && currentImageUrl.trim() !== ""
            ? "Selecciona una nueva imagen para reemplazar la actual. "
            : ""}
          Formatos: JPG, PNG, WebP. Tamaño máximo: 2MB. Dimensiones: 300x300px a 2000x2000px.
        </small>
      </div>

      <div className="form-actions">
        <button
          className="btn-primary"
          type="submit"
          disabled={form.loading}
        >
          {form.loading ? "Guardando..." : isEditing ? "Guardar" : "Añadir"}
        </button>
        <button
          className="btn-secondary"
          type="button"
          onClick={onCancel}
          disabled={form.loading}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
