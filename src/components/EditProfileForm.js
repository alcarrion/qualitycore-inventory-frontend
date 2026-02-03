// src/components/EditProfileForm.js
import React, { useState } from "react";
import { patchUser } from "../services/api";
import { useApp } from "../contexts/AppContext";
import "../styles/components/Form.css";

export default function EditProfileForm({ user, onSave, onCancel }) {
  const { showSuccess, showError } = useApp();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validar email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Por favor ingresa un correo electrónico válido.");
      setLoading(false);
      return;
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      showError("El número de teléfono debe tener exactamente 10 dígitos numéricos.");
      setLoading(false);
      return;
    }

    try {
      const resp = await patchUser(user.id, { name, email, phone: phone || null });

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
          showError(errorMessages || "No se pudo actualizar el perfil.");
        } else {
          showError(resp.data?.detail || "No se pudo actualizar el perfil.");
        }
        setLoading(false);
        return;
      }

      try {
        const updated = { ...user, ...(resp.data || {}) };
        localStorage.setItem("user", JSON.stringify(updated));
      } catch {}

      showSuccess("Perfil actualizado correctamente.");
      onSave?.(resp.data);
    } catch (err) {
      showError(err.message || "Hubo un error al guardar los cambios.");
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
        <label>Correo Electrónico</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Teléfono</label>
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="0987654321"
        />
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
