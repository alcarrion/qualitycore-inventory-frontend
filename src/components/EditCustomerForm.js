// src/components/EditCustomerForm.js
import React, { useState } from "react";
import { patchCustomer } from "../services/api";
import { useApp } from "../contexts/AppContext";
import {
  validateEcuadorianCedula,
  validateEcuadorianRUC,
  validatePassport
} from "../utils/ecuadorianValidators";
import "../styles/components/Form.css";

export default function EditCustomerForm({ customer, onSave, onCancel }) {
  const { showSuccess, showError } = useApp();
  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email);
  const [phone, setPhone] = useState(customer.phone || "");
  const [documentType, setDocumentType] = useState(customer.document_type || "cedula");
  const [document, setDocument] = useState(customer.document);
  const [address, setAddress] = useState(customer.address || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !document || !phone || !documentType) {
      showError("Todos los campos son obligatorios excepto dirección.");
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
      showError("El teléfono debe tener exactamente 10 dígitos.");
      setLoading(false);
      return;
    }

    try {
      const resp = await patchCustomer(customer.id, {
        name,
        email,
        phone,
        document_type: documentType,
        document,
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

          showError(errorMessages || "No se pudo editar el cliente.");
        } else {
          showError(resp.data?.detail || "No se pudo editar el cliente.");
        }
        setLoading(false);
        return;
      }

      showSuccess("Cliente editado correctamente.");
      onSave?.(resp.data);
    } catch (err) {
      const errorMsg = err.message || "Error al editar cliente.";
      showError(errorMsg);
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
      <div className="form-title">Editar cliente</div>

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
            setDocument(""); // Limpiar el documento cuando cambia el tipo
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
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
