// src/components/SupplierForm.tsx
import React, { useState } from "react";
import { postSupplier, patchSupplier } from "../services/api";
import { useApp } from "../contexts/AppContext";
import { extractFormErrors } from "../utils/errorHandler";
import {
  validateEcuadorianCedula,
  validateEcuadorianRUC,
  validatePassport,
} from "../utils/ecuadorianValidators";
import { ERRORS, SUCCESS, ENTITIES } from "../constants/messages";
import { getDocumentLabel, getDocumentPlaceholder } from "../utils/documentLabels";
import type { Supplier, DocumentType } from "../types/models";
import "../styles/components/Form.css";

interface Props {
  supplier?: Supplier | null;
  onSave?: (data: unknown) => void;
  onCancel?: () => void;
}

export default function SupplierForm({ supplier = null, onSave, onCancel }: Props) {
  const isEditing = !!supplier;
  const { showSuccess, showError } = useApp();

  const [name, setName] = useState(supplier?.name || "");
  const [email, setEmail] = useState(supplier?.email || "");
  const [documentType, setDocumentType] = useState(supplier?.document_type || "ruc");
  const [taxId, setTaxId] = useState(supplier?.tax_id || "");
  const [phone, setPhone] = useState(supplier?.phone || "");
  const [address, setAddress] = useState(supplier?.address || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !taxId || !phone || !documentType) {
      showError(ERRORS.REQUIRED_FIELDS_EXCEPT_ADDRESS);
      setLoading(false);
      return;
    }

    try {
      if (documentType === "cedula") {
        validateEcuadorianCedula(taxId);
      } else if (documentType === "ruc") {
        validateEcuadorianRUC(taxId);
      } else if (documentType === "passport") {
        validatePassport(taxId);
      }
    } catch (error) {
      showError((error as Error).message);
      setLoading(false);
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      showError(ERRORS.PHONE_LENGTH);
      setLoading(false);
      return;
    }

    const data = { name, email, document_type: documentType, tax_id: taxId, phone, address };

    try {
      const resp = isEditing
        ? await patchSupplier(supplier!.id, data)
        : await postSupplier(data);

      if (!resp.ok) {
        const fallback = isEditing
          ? ERRORS.UPDATE_FAILED(ENTITIES.SUPPLIER)
          : ERRORS.CREATE_FAILED(ENTITIES.SUPPLIER);
        showError(extractFormErrors(resp.data, fallback));
        setLoading(false);
        return;
      }

      showSuccess(isEditing ? SUCCESS.UPDATED('Proveedor') : SUCCESS.CREATED('Proveedor'));
      onSave?.(resp.data);
    } catch (err) {
      const errorMsg = isEditing
        ? ERRORS.UPDATE_FAILED(ENTITIES.SUPPLIER)
        : ERRORS.CREATE_FAILED(ENTITIES.SUPPLIER);
      showError((err as Error).message || errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="form-title">
        {isEditing ? "Editar proveedor" : "Añadir nuevo proveedor"}
      </div>

      <div className="form-group">
        <label>Nombre</label>
        <input value={name} onChange={e => setName(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Correo</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value.toLowerCase())}
          placeholder="ejemplo@correo.com"
          required
        />
      </div>

      <div className="form-group">
        <label>Tipo de Documento</label>
        <select
          value={documentType}
          onChange={(e) => { setDocumentType(e.target.value as DocumentType); setTaxId(""); }}
          required
        >
          <option value="ruc">RUC</option>
          <option value="cedula">Cédula</option>
          <option value="passport">Pasaporte</option>
        </select>
      </div>

      <div className="form-group">
        <label>{getDocumentLabel(documentType)}</label>
        <input
          value={taxId}
          onChange={e => setTaxId(e.target.value)}
          placeholder={getDocumentPlaceholder(documentType)}
          required
        />
      </div>

      <div className="form-group">
        <label>Teléfono</label>
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="0987654321"
          required
        />
      </div>

      <div className="form-group">
        <label>Dirección</label>
        <input value={address} onChange={e => setAddress(e.target.value)} />
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
