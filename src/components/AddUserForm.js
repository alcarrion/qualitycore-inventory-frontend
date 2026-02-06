// src/components/AddUserForm.js
import React, { useState } from "react";
import { postUser } from "../services/api";
import { useApp } from "../contexts/AppContext";
import { Eye, EyeOff } from "lucide-react";
import { isSuperAdmin as checkIsSuperAdmin } from "../constants/roles";
import { ERRORS, SUCCESS, ENTITIES } from "../constants/messages";
import { validatePassword } from "../utils/validatePassword";
import "../styles/components/Form.css";

export function AddUserForm({ onSave, onCancel }) {
  const { showSuccess, showError } = useApp();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = checkIsSuperAdmin(currentUser?.role);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("User");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validar teléfono
    if (!/^\d{10}$/.test(phone)) {
      showError(ERRORS.PHONE_LENGTH);
      setLoading(false);
      return;
    }

    // Validar contraseña
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      showError(passwordValidation.error);
      setLoading(false);
      return;
    }

    try {
      const resp = await postUser({ name, email, phone, role, password });

      if (!resp.ok) {
        if (resp.data && typeof resp.data === 'object') {
          const errorMessages = Object.entries(resp.data)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return messages.join(', ');
              }
              return messages;
            })
            .join('. ');

          showError(errorMessages || ERRORS.CREATE_FAILED(ENTITIES.USER));
        } else {
          showError(resp.data?.detail || ERRORS.CREATE_FAILED(ENTITIES.USER));
        }
        setLoading(false);
        return;
      }

      showSuccess(SUCCESS.CREATED('Usuario'));
      onSave?.(resp.data);
    } catch (err) {
      showError(err.message || ERRORS.CREATE_FAILED(ENTITIES.USER));
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
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value.toLowerCase())}
          placeholder="ejemplo@correo.com"
          required
        />
      </div>

      <div className="form-group">
        <label>Teléfono</label>
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="0987654321"
          required
        />
      </div>

      <div className="form-group">
        <label>Rol</label>
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="User">Usuario</option>
          <option value="Administrator">Administrador</option>
          {isSuperAdmin && <option value="SuperAdmin">Super Administrador</option>}
        </select>
      </div>

      <div className="form-group">
        <label>Contraseña</label>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <span
            className="password-toggle-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>
      </div>

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
