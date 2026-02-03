// src/components/AddUserForm.js
import React, { useState } from "react";
import { postUser } from "../services/api";
import { useApp } from "../contexts/AppContext";
import { Eye, EyeOff } from "lucide-react";
import "../styles/components/Form.css";

export function AddUserForm({ onSave, onCancel }) {
  const { showSuccess, showError } = useApp();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = currentUser?.role === "SuperAdmin";

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
      showError("El número de teléfono debe tener exactamente 10 dígitos.");
      setLoading(false);
      return;
    }

    // Validar longitud mínima de contraseña
    if (password.length < 8) {
      showError("La contraseña debe tener al menos 8 caracteres.");
      setLoading(false);
      return;
    }

    // Validar mayúscula
    if (!/[A-Z]/.test(password)) {
      showError("La contraseña debe contener al menos una letra mayúscula.");
      setLoading(false);
      return;
    }

    // Validar minúscula
    if (!/[a-z]/.test(password)) {
      showError("La contraseña debe contener al menos una letra minúscula.");
      setLoading(false);
      return;
    }

    // Validar número
    if (!/\d/.test(password)) {
      showError("La contraseña debe contener al menos un número.");
      setLoading(false);
      return;
    }

    // Validar carácter especial
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;~`]/.test(password)) {
      showError("La contraseña debe contener al menos un carácter especial (!@#$%^&*(),.?\":{}|<>_-+=[]\\\/;~`).");
      setLoading(false);
      return;
    }

    try {
      const resp = await postUser({ name, email, phone, role, password });

      if (!resp.ok) {
        // Manejar errores de validación del backend
        if (resp.data && typeof resp.data === 'object') {
          // Formatear errores de validación sin el prefijo del campo
          const errorMessages = Object.entries(resp.data)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return messages.join(', ');
              }
              return messages;
            })
            .join('. ');

          showError(errorMessages || "No se pudo crear el usuario.");
        } else {
          showError(resp.data?.detail || "No se pudo crear el usuario.");
        }
        setLoading(false);
        return;
      }

      showSuccess("Usuario creado correctamente.");
      onSave?.(resp.data);
    } catch (err) {
      const errorMsg = err.message || "Hubo un error al crear el usuario.";
      showError(errorMsg);
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
