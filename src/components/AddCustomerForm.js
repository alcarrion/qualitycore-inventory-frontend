// src/components/AddCustomerForm.js
import React, { useState } from "react";
import { postCustomer } from "../services/api";
import { useApp } from "../contexts/AppContext";
import {
  validateEcuadorianCedula,
  validateEcuadorianRUC,
  validatePassport
} from "../utils/ecuadorianValidators";
import { ERRORS, SUCCESS, ENTITIES } from "../constants/messages";
import "../styles/components/Form.css";

export default function AddCustomerForm({ onSave, onCancel }) {
  const { showSuccess, showError } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [documentType, setDocumentType] = useState("cedula");
  const [document, setDocument] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !document || !phone || !documentType) {
      showError(ERRORS.REQUIRED_FIELDS);
      setLoading(false);
      return;
    }

    // Validar el documento según el tipo seleccionado
    try {
      if (documentType === "cedula") {
        validateEcuadorianCedula(document);
      } else if (documentType === "ruc") {
        validateEcuadorianRUC(document);
      } else if (documentType === "passport") {
        validatePassport(document);
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
      const resp = await postCustomer({
        name,
        email,
        document_type: documentType,
        document,
        phone,
        address
      });

      if (!resp.ok) {
        if (resp.data && typeof resp.data === 'object') {
          const errorMessages = Object.entries(resp.data)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return messages.join(', ');
              }
              return messages;
            })
            .join('. ');

          showError(errorMessages || ERRORS.CREATE_FAILED(ENTITIES.CUSTOMER));
        } else {
          showError(resp.data?.detail || ERRORS.CREATE_FAILED(ENTITIES.CUSTOMER));
        }
        setLoading(false);
        return;
      }

      showSuccess(SUCCESS.CREATED('Cliente'));
      onSave?.(resp.data);
    } catch (err) {
      showError(err.message || ERRORS.CREATE_FAILED(ENTITIES.CUSTOMER));
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
      <div className="form-title">Añadir nuevo cliente</div>

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
          onChange={(e) => {
            setDocumentType(e.target.value);
            setDocument("");
          }}
          required
        >
          <option value="cedula">Cédula</option>
          <option value="ruc">RUC</option>
          <option value="passport">Pasaporte</option>
        </select>
      </div>

      <div className="form-group">
        <label>{getDocumentLabel()}</label>
        <input
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          placeholder={getDocumentPlaceholder()}
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
          {loading ? "Guardando..." : "Añadir"}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
