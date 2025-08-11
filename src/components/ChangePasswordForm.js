// src/components/ChangePasswordForm.js
import React, { useState } from "react";
import { API_URL, getCookie } from "../services/api";
import "../styles/components/Form.css";

export function ChangePasswordForm({ onSave, onCancel }) {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPass !== confirmPass) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setError("");

    const csrftoken = getCookie("csrftoken");

    try {
      const res = await fetch(`${API_URL}/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        credentials: "include",
        body: JSON.stringify({ old_password: oldPass, new_password: newPass }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Si el backend devuelve errores tipo {"old_password": ["incorrect"]}
        if (data?.old_password) {
          setError(`Contraseña actual: ${data.old_password.join(" ")}`);
        } else if (data?.new_password) {
          setError(`Nueva contraseña: ${data.new_password.join(" ")}`);
        } else {
          setError("Error al cambiar la contraseña.");
        }
        return;
      }

      alert("Contraseña cambiada con éxito. Debes volver a iniciar sesión.");
      onSave(); // ← cerrar modal u otras acciones
      window.location.href = "/login";
    } catch (err) {
      setError("Hubo un error al cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="form-title">Cambiar Contraseña</div>

      <div className="form-group">
        <label>Contraseña Actual</label>
        <input
          type="password"
          value={oldPass}
          onChange={e => setOldPass(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Nueva Contraseña</label>
        <input
          type="password"
          value={newPass}
          onChange={e => setNewPass(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Confirmar Nueva Contraseña</label>
        <input
          type="password"
          value={confirmPass}
          onChange={e => setConfirmPass(e.target.value)}
          required
        />
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
