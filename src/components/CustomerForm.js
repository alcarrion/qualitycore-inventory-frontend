// src/components/CustomerForm.js
// Form unificado para crear y editar clientes
import React, { useState } from "react";
import { postCustomer, patchCustomer } from "../services/api";
import { useApp } from "../contexts/AppContext";
import {
  validateEcuadorianCedula,
  validateEcuadorianRUC,
  validatePassport
} from "../utils/ecuadorianValidators";
import { ERRORS, SUCCESS, ENTITIES } from "../constants/messages";
import "../styles/components/Form.css";

/**
 * CustomerForm - Formulario unificado para crear/editar clientes
 * @param {Object} customer - Cliente a editar (null para crear nuevo)
 * @param {Function} onSave - Callback al guardar exitosamente
 * @param {Function} onCancel - Callback al cancelar
 */
export default function CustomerForm({ customer = null, onSave, onCancel }) {
  const isEditing = !!customer;
  const { showSuccess, showError } = useApp();

  // Estado del formulario - usa valores del cliente si existe, sino vacío
  const [name, setName] = useState(customer?.name || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [documentType, setDocumentType] = useState(customer?.document_type || "cedula");
  const [document, setDocument] = useState(customer?.document || "");
  const [address, setAddress] = useState(customer?.address || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validar campos requeridos
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

    const data = {
      name,
      email,
      document_type: documentType,
      document,
      phone,
      address
    };

    try {
      // Crear o actualizar según el modo
      const resp = isEditing
        ? await patchCustomer(customer.id, data)
        : await postCustomer(data);

      if (!resp.ok) {
        // Manejar errores de validación del backend
        if (resp.data && typeof resp.data === 'object') {
          const errorMessages = Object.entries(resp.data)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return messages.join(', ');
              }
              return messages;
            })
            .join('. ');

          const errorMsg = isEditing
            ? ERRORS.UPDATE_FAILED(ENTITIES.CUSTOMER)
            : ERRORS.CREATE_FAILED(ENTITIES.CUSTOMER);
          showError(errorMessages || errorMsg);
        } else {
          const errorMsg = isEditing
            ? ERRORS.UPDATE_FAILED(ENTITIES.CUSTOMER)
            : ERRORS.CREATE_FAILED(ENTITIES.CUSTOMER);
          showError(resp.data?.detail || errorMsg);
        }
        setLoading(false);
        return;
      }

      // Éxito
      const successMsg = isEditing
        ? SUCCESS.UPDATED('Cliente')
        : SUCCESS.CREATED('Cliente');
      showSuccess(successMsg);
      onSave?.(resp.data);
    } catch (err) {
      const errorMsg = isEditing
        ? ERRORS.UPDATE_FAILED(ENTITIES.CUSTOMER)
        : ERRORS.CREATE_FAILED(ENTITIES.CUSTOMER);
      showError(err.message || errorMsg);
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
          {loading ? "Guardando..." : (isEditing ? "Guardar" : "Añadir")}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
