// src/components/EditCustomerForm.js
import React, { useState } from "react";
import { API_URL, getCookie } from "../services/api";
import "../styles/components/Form.css";

export default function EditCustomerForm({ cliente, onSave, onCancel }) {
  const [name, setName] = useState(cliente.name);
  const [email, setEmail] = useState(cliente.email);
  const [phone, setPhone] = useState(cliente.phone || "");
  const [document, setDocument] = useState(cliente.document);
  const [address, setAddress] = useState(cliente.address || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!name || !email || !document || !phone) {
      setError("Todos los campos son obligatorios excepto dirección.");
      setLoading(false);
      return;
    }

    if (!/^[0-9]{10,13}$/.test(document)) {
      setError("La cédula debe tener entre 10 y 13 dígitos numéricos.");
      setLoading(false);
      return;
    }

    if (!/^[0-9]+$/.test(phone)) {
      setError("El teléfono solo debe contener números.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/customers/${cliente.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: JSON.stringify({ name, email, phone, document, address }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "No se pudo editar el cliente.");
      }

      const data = await res.json();
      onSave(data);
    } catch (err) {
      setError(err.message || "Error al editar cliente.");
    } finally {
      setLoading(false);
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
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Cédula / RUC</label>
        <input value={document} onChange={(e) => setDocument(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Teléfono</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Dirección</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      {error && <div className="form-error">{error}</div>}
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