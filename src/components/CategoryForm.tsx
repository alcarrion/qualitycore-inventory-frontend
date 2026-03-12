// components/CategoryForm.tsx
import React, { useState } from "react";
import { postCategory, patchCategory } from "../services/api";
import { useApp } from "../contexts/AppContext";
import { useMasterDataStore } from "../store/masterDataStore";
import { extractFormErrors } from "../utils/errorHandler";
import { ERRORS, SUCCESS, ENTITIES } from "../constants/messages";
import type { Category } from "../types/models";
import "../styles/components/Form.css";

interface Props {
  category?: Category | null;
  onSave?: (data: unknown) => void;
  onCancel?: () => void;
}

export default function CategoryForm({ category = null, onSave, onCancel }: Props) {
  const isEditing = !!category;
  const { showSuccess, showError } = useApp();
  const [name, setName] = useState(category?.name ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError(ERRORS.REQUIRED_FIELDS);
      return;
    }

    setLoading(true);
    const resp = isEditing
      ? await patchCategory(category!.id, { name: name.trim() })
      : await postCategory(name.trim());
    setLoading(false);

    if (!resp.ok) {
      showError(extractFormErrors(
        resp.data,
        isEditing ? ERRORS.UPDATE_FAILED(ENTITIES.CATEGORY) : ERRORS.CREATE_FAILED(ENTITIES.CATEGORY)
      ));
      return;
    }

    // Refrescar el store para que el dropdown de ProductForm refleje el cambio inmediatamente
    useMasterDataStore.getState().fetchCategories();

    showSuccess(isEditing ? SUCCESS.UPDATED("Categoría") : SUCCESS.CREATED("Categoría"));
    onSave?.(resp.data);
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="form-title">
        {isEditing ? "Editar Categoría" : "Añadir Categoría"}
      </div>

      <div className="form-group">
        <label>
          Nombre <span style={{ color: "var(--color-error)" }}>*</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Electrónica, Herramientas, Repuestos..."
          maxLength={50}
          autoFocus
        />
        <small className="form-hint">{name.length}/50 caracteres</small>
      </div>

      <div className="form-actions">
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Añadir categoría"}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
