// src/components/AddUserForm.js
import React, { useState } from "react";
import { postUser } from "../services/api";
import "../styles/components/Form.css";

export function AddUserForm({ onSave, onCancel }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("User");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!/^\d{10}$/.test(phone)) {
      setError("El número de teléfono debe tener exactamente 10 dígitos.");
      setLoading(false);
      return;
    }

    try {
      const resp = await postUser({ name, email, phone, role, password });

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
            : "No se pudo crear el usuario.");
        throw new Error(msg);
      }

      onSave?.(resp.data);
    } catch (err) {
      setError(err.message || "Hubo un error al crear el usuario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="form-title">Añadir nuevo usuario</div>

      <div className="form-group">
        <label>Nombre</label>
        <input value={name} onChange={e => setName(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Correo</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Teléfono</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Rol</label>
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="User">Usuario</option>
          <option value="Administrator">Administrador</option>
        </select>
      </div>

      <div className="form-group">
        <label>Contraseña</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
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
