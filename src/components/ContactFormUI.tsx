// components/ContactFormUI.tsx
// JSX compartido entre CustomerForm y SupplierForm.
// Recibe el estado del hook useContactForm y el callback onCancel.
import React from "react";
import { getDocumentLabel, getDocumentPlaceholder } from "../utils/documentLabels";
import type { DocumentType } from "../types/models";
import type { useContactForm } from "../hooks/useContactForm";
import "../styles/components/Form.css";

interface ContactFormUIProps {
  form: ReturnType<typeof useContactForm>;
  title: string;
  onCancel?: () => void;
}

export function ContactFormUI({ form, title, onCancel }: ContactFormUIProps) {
  const {
    name, setName, email, setEmail,
    documentType, setDocumentType, documentValue, setDocumentValue,
    phone, setPhone, address, setAddress,
    loading, isEditing, handleSubmit,
  } = form;

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="form-title">{title}</div>

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
          onChange={e => { setDocumentType(e.target.value as DocumentType); setDocumentValue(""); }}
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
          value={documentValue}
          onChange={e => setDocumentValue(e.target.value)}
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
