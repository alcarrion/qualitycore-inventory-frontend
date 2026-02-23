// src/components/EditProfileForm.js
import React, { useState } from "react";
import { patchUser } from "../services/api";
import { useApp } from "../contexts/AppContext";
import { ERRORS, SUCCESS } from "../constants/messages";
import { extractFormErrors } from "../utils/errorHandler";
import { updateStoredUser } from "../services/authService";
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
      showError(ERRORS.INVALID_EMAIL);
      setLoading(false);
      return;
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      showError(ERRORS.PHONE_LENGTH);
      setLoading(false);
      return;
    }

    try {
      const resp = await patchUser(user.id, { name, email, phone: phone || null });

      if (!resp.ok) {
        showError(extractFormErrors(resp.data, ERRORS.UPDATE_FAILED('el perfil')));
        setLoading(false);
        return;
      }

      updateStoredUser(resp.data || {});

      showSuccess(SUCCESS.UPDATED('Perfil'));
      onSave?.(resp.data);
    } catch (err) {
      showError(err.message || ERRORS.UPDATE_FAILED('el perfil'));
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
