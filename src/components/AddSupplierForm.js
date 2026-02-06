// src/components/AddSupplierForm.js
import React, { useState } from "react";
import { postSupplier } from "../services/api";
import { useApp } from "../contexts/AppContext";
import {
  validateEcuadorianCedula,
  validateEcuadorianRUC,
  validatePassport
} from "../utils/ecuadorianValidators";
import { ERRORS, SUCCESS, ENTITIES } from "../constants/messages";
import "../styles/components/Form.css";

export default function AddSupplierForm({ onSave, onCancel }) {
  const { showSuccess, showError } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [documentType, setDocumentType] = useState("ruc");
  const [taxId, setTaxId] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !taxId || !phone || !documentType) {
      showError(ERRORS.REQUIRED_FIELDS_EXCEPT_ADDRESS);
      setLoading(false);
      return;
    }

    // Validar el documento según el tipo seleccionado
    try {
      if (documentType === "cedula") {
        validateEcuadorianCedula(taxId);
      } else if (documentType === "ruc") {
        validateEcuadorianRUC(taxId);
      } else if (documentType === "passport") {
        validatePassport(taxId);
      }
    } catch (error) {
      showError(error.message);
      setLoading(false);
      return;
    }

    // Validar teléfono
    if (!/^\d{10}$/.test(phone)) {
      showError(ERRORS.PHONE_LENGTH);
      setLoading(false);
      return;
    }

    try {
      const resp = await postSupplier({
        name,
        email,
        document_type: documentType,
        tax_id: taxId,
        phone,
        address,
      });

      if (!resp.ok) {
        // Manejar errores de validación del backend
        if (resp.data && typeof resp.data === 'object') {
          // Formatear errores de validación sin el prefijo del campo
          const errorMessages = Object.entries(resp.data)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return messages.join(', ');
              }
              return messages;
            })
            .join('. ');

          showError(errorMessages || ERRORS.CREATE_FAILED(ENTITIES.SUPPLIER));
        } else {
          showError(resp.data?.detail || ERRORS.CREATE_FAILED(ENTITIES.SUPPLIER));
        }
        setLoading(false);
        return;
      }

      showSuccess(SUCCESS.CREATED('Proveedor'));
      onSave?.(resp.data);
    } catch (err) {
      showError(err.message || ERRORS.CREATE_FAILED(ENTITIES.SUPPLIER));
    } finally {
      setLoading(false);
    }
  };

  const getDocumentPlaceholder = () => {
    switch (documentType) {
      case "cedula":
        return "10 dígitos";
      case "ruc":
        return "13 dígitos";
      case "passport":
        return "6-9 caracteres alfanuméricos";
      default:
        return "";
    }
  };

  const getDocumentLabel = () => {
    switch (documentType) {
      case "cedula":
        return "Cédula";
      case "ruc":
        return "RUC";
      case "passport":
        return "Pasaporte";
      default:
        return "Documento";
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="form-title">Añadir nuevo proveedor</div>

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
          onChange={(e) => {
            setDocumentType(e.target.value);
            setTaxId(""); // Limpiar el documento cuando cambia el tipo
          }}
          required
        >
          <option value="ruc">RUC</option>
          <option value="cedula">Cédula</option>
          <option value="passport">Pasaporte</option>
        </select>
      </div>

      <div className="form-group">
        <label>{getDocumentLabel()}</label>
        <input
          value={taxId}
          onChange={e => setTaxId(e.target.value)}
          placeholder={getDocumentPlaceholder()}
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
          {loading ? "Guardando..." : "Añadir"}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
