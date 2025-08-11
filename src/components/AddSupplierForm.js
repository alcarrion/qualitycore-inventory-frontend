// src/components/AddSupplierForm.js
import React, { useState } from "react";
import { postSupplier } from "../services/api";
import "../styles/components/Form.css";

export default function AddSupplierForm({ onSave, onCancel }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [taxId, setTaxId] = useState("");     // RUC/Cédula
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!name || !email || !taxId || !phone) {
      setError("Todos los campos son obligatorios excepto dirección.");
      setLoading(false);
      return;
    }
    if (!/^[0-9]{10,13}$/.test(taxId)) {
      setError("La cédula o RUC debe tener entre 10 y 13 dígitos numéricos.");
      setLoading(false);
      return;
    }
    if (!/^[0-9]+$/.test(phone)) {
      setError("El teléfono solo debe contener números.");
      setLoading(false);
      return;
    }

    try {
      const resp = await postSupplier({
        name,
        email,
        tax_id: taxId,  // ajusta el nombre del campo según tu modelo/serializer
        phone,
        address,
      });

      if (!resp.ok) {
        // si DRF devuelve errores de validación, muéstralos
        const msg =
          resp.data?.detail ||
          (resp.data && typeof resp.data === "object"
            ? Object.values(resp.data).flat().join(" ")
            : "No se pudo crear el proveedor.");
        throw new Error(msg);
      }

      onSave?.(resp.data);
    } catch (err) {
      setError(err.message || "Error al crear proveedor.");
    } finally {
      setLoading(false);
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
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>RUC / Cédula</label>
        <input value={taxId} onChange={e => setTaxId(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Teléfono</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Dirección</label>
        <input value={address} onChange={e => setAddress(e.target.value)} />
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
