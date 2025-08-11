// src/components/AddUserForm.js
import React, { useState } from "react";
import { API_URL, getCookie } from "../services/api";
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

    const csrftoken = getCookie("csrftoken");

    try {
      const res = await fetch(`${API_URL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        credentials: "include",
        body: JSON.stringify({ name, email, phone, role, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        let errorMsg = "No se pudo crear el usuario.";
        if (typeof data === "object" && data !== null) {
          const detalles = Object.entries(data)
            .map(([campo, errores]) => `${campo}: ${errores.join(", ")}`)
            .join(" | ");
          errorMsg += ` Motivo: ${detalles}`;
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      onSave(data);
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
        <input value={phone} onChange={e => setPhone(e.target.value)} />
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
        <button className="btn-secondary" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
