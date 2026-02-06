// src/components/ChangePasswordForm.js
import React, { useState } from "react";
import { changePassword } from "../services/api";
import { useApp } from "../contexts/AppContext";
import { ERRORS, SUCCESS } from "../constants/messages";
import { validatePassword } from "../utils/validatePassword";
import { Eye, EyeOff } from "lucide-react";
import "../styles/components/Form.css";

export function ChangePasswordForm({ onSave, onCancel }) {
  const { showSuccess, showError } = useApp();
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar contraseña
    const passwordValidation = validatePassword(newPass, confirmPass);
    if (!passwordValidation.valid) {
      showError(passwordValidation.error);
      return;
    }

    setLoading(true);

    try {
      const resp = await changePassword(oldPass, newPass);

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
          showError(errorMessages || ERRORS.PASSWORD_CHANGE_FAILED);
        } else {
          showError(resp.data?.detail || ERRORS.PASSWORD_CHANGE_FAILED);
        }
        setLoading(false);
        return;
      }

      showSuccess(SUCCESS.PASSWORD_CHANGED);
      onSave?.();

      // Limpiar localStorage y redirigir al login
      setTimeout(() => {
        localStorage.removeItem("user");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/";
      }, 2000); // Dar tiempo para ver el toast antes de redirigir
    } catch (err) {
      showError(err.message || ERRORS.PASSWORD_CHANGE_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="form-title">Cambiar Contraseña</div>

      <div className="form-group">
        <label>Contraseña Actual</label>
        <div className="password-input-wrapper">
          <input
            type={showOldPass ? "text" : "password"}
            value={oldPass}
            onChange={e => setOldPass(e.target.value)}
            required
          />
          <span
            className="password-toggle-icon"
            onClick={() => setShowOldPass(!showOldPass)}
          >
            {showOldPass ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>
      </div>

      <div className="form-group">
        <label>Nueva Contraseña</label>
        <div className="password-input-wrapper">
          <input
            type={showNewPass ? "text" : "password"}
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            required
          />
          <span
            className="password-toggle-icon"
            onClick={() => setShowNewPass(!showNewPass)}
          >
            {showNewPass ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>
      </div>

      <div className="form-group">
        <label>Confirmar Nueva Contraseña</label>
        <div className="password-input-wrapper">
          <input
            type={showConfirmPass ? "text" : "password"}
            value={confirmPass}
            onChange={e => setConfirmPass(e.target.value)}
            required
          />
          <span
            className="password-toggle-icon"
            onClick={() => setShowConfirmPass(!showConfirmPass)}
          >
            {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>
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
