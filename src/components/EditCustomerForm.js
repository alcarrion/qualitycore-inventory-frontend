// src/components/EditCustomerForm.js
import React, { useState } from "react";
import { patchCustomer } from "../services/api";
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
    if (!/^\d{10,13}$/.test(document)) {
      setError("La cédula debe tener entre 10 y 13 dígitos numéricos.");
      setLoading(false);
      return;
    }
    if (!/^\d+$/.test(phone)) {
      setError("El teléfono solo debe contener números.");
      setLoading(false);
      return;
    }

    try {
      const resp = await patchCustomer(cliente.id, {
        name,
        email,
        phone,
        document,
        address,
      });

      if (!resp.ok) {
        const d = resp.data;
        const msg =
          d?.detail ||
          (d && typeof d === "object"
            ? Object.entries(d)
                .map(([campo, errs]) =>
                  Array.isArray(errs) ? `${campo}: ${errs.join(", ")}` : `${campo}: ${String(errs)}`
                )
                .join(" | ")
            : "No se pudo editar el cliente.");
        throw new Error(msg);
      }

      onSave?.(resp.data);
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
