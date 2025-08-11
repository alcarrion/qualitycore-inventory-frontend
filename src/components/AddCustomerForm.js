// src/components/AddCustomerForm.js
import React, { useState } from "react";
import { postCliente } from "../services/api";   // ✅ usar wrapper
import "../styles/components/Form.css";

export default function AddCustomerForm({ onSave, onCancel }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");   // cédula/RUC
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();       // ✅ evita GET
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
      // 👇 usa el wrapper (mete CSRF y cookies)
      const resp = await postCliente({
        name,
        email,
        phone,
        // ajusta el nombre del campo según tu serializer:
        // si tu API espera 'cedula_ruc', cambia 'document' por 'cedula_ruc'
        document,
        address
      });

      if (!resp.ok) {
        throw new Error(resp.data?.detail || "No se pudo crear el cliente.");
      }

      onSave?.(resp.data);
    } catch (err) {
      setError(err.message || "Error al crear cliente.");
    } finally {
      setLoading(false);
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
          {loading ? "Guardando..." : "Añadir"}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
