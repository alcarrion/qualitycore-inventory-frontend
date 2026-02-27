// src/components/CustomerForm.tsx
import React, { useState } from "react";
import { postCustomer, patchCustomer } from "../services/api";
import { useApp } from "../contexts/AppContext";
import { extractFormErrors } from "../utils/errorHandler";
import {
  validateEcuadorianCedula,
  validateEcuadorianRUC,
  validatePassport,
} from "../utils/ecuadorianValidators";
import { ERRORS, SUCCESS, ENTITIES } from "../constants/messages";
import { getDocumentLabel, getDocumentPlaceholder } from "../utils/documentLabels";
import type { Customer, DocumentType } from "../types/models";
import "../styles/components/Form.css";

interface Props {
  customer?: Customer | null;
  onSave?: (data: unknown) => void;
  onCancel?: () => void;
}

export default function CustomerForm({ customer = null, onSave, onCancel }: Props) {
  const isEditing = !!customer;
  const { showSuccess, showError } = useApp();

  const [name, setName] = useState(customer?.name || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [documentType, setDocumentType] = useState(customer?.document_type || "cedula");
  const [document, setDocument] = useState(customer?.document || "");
  const [address, setAddress] = useState(customer?.address || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !document || !phone || !documentType) {
      showError(ERRORS.REQUIRED_FIELDS);
      setLoading(false);
      return;
    }

    try {
      if (documentType === "cedula") {
        validateEcuadorianCedula(document);
      } else if (documentType === "ruc") {
        validateEcuadorianRUC(document);
      } else if (documentType === "passport") {
        validatePassport(document);
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

    const data = { name, email, document_type: documentType, document, phone, address };

    try {
      const resp = isEditing
        ? await patchCustomer(customer!.id, data)
        : await postCustomer(data);

      if (!resp.ok) {
        const fallback = isEditing
          ? ERRORS.UPDATE_FAILED(ENTITIES.CUSTOMER)
          : ERRORS.CREATE_FAILED(ENTITIES.CUSTOMER);
        showError(extractFormErrors(resp.data, fallback));
        setLoading(false);
        return;
      }

      showSuccess(isEditing ? SUCCESS.UPDATED('Cliente') : SUCCESS.CREATED('Cliente'));
      onSave?.(resp.data);
    } catch (err) {
      const errorMsg = isEditing
        ? ERRORS.UPDATE_FAILED(ENTITIES.CUSTOMER)
        : ERRORS.CREATE_FAILED(ENTITIES.CUSTOMER);
      showError((err as Error).message || errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="form-title">
        {isEditing ? "Editar cliente" : "Añadir nuevo cliente"}
      </div>

      <div className="form-group">
        <label>Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Correo</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          placeholder="ejemplo@correo.com"
          required
        />
      </div>

      <div className="form-group">
        <label>Tipo de Documento</label>
        <select
          value={documentType}
          onChange={(e) => { setDocumentType(e.target.value as DocumentType); setDocument(""); }}
          required
        >
          <option value="cedula">Cédula</option>
          <option value="ruc">RUC</option>
          <option value="passport">Pasaporte</option>
        </select>
      </div>

      <div className="form-group">
        <label>{getDocumentLabel(documentType)}</label>
        <input
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          placeholder={getDocumentPlaceholder(documentType)}
          required
        />
      </div>

      <div className="form-group">
        <label>Teléfono</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0987654321"
          required
        />
      </div>

      <div className="form-group">
        <label>Dirección</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} />
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
