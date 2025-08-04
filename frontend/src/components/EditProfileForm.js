// src/components/EditProfileForm.js
import React, { useState } from "react";
import { API_URL, getCookie } from "../services/api";
import "../styles/components/Form.css";

export default function EditProfileForm({ user, onSave, onCancel }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (phone && !/^\d{10}$/.test(phone)) {
      setError("El número de teléfono debe tener exactamente 10 dígitos numéricos.");
      setLoading(false);
      return;
    }

    const csrftoken = getCookie("csrftoken");

    try {
      const res = await fetch(`${API_URL}/users/${user.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        credentials: "include",
        body: JSON.stringify({ name, phone }),
      });
      if (!res.ok) throw new Error("No se pudo actualizar.");
      const data = await res.json();
      onSave(data);
    } catch (err) {
      setError("Hubo un error al guardar los cambios.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="form-title">Editar Perfil</div>

      <div className="form-group">
        <label>Nombre</label>
        <input value={name} onChange={e => setName(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Teléfono</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} />
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="form-actions">
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
