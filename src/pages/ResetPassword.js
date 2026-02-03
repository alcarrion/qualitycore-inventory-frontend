// src/pages/ResetPassword.js
import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { postResetPassword } from "../services/api";
import { useApp } from "../contexts/AppContext";
import "../styles/pages/ResetPassword.css";

export default function ResetPassword() {
  const { showSuccess, showError } = useApp();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!uid || !token) {
    return (
      <div className="login-container">
        <div className="card" style={{ margin: 60 }}>
          El enlace no es válido o ha expirado.
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar longitud mínima
    if (password.length < 8) {
      showError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    // Validar mayúscula
    if (!/[A-Z]/.test(password)) {
      showError("La contraseña debe contener al menos una letra mayúscula.");
      return;
    }

    // Validar minúscula
    if (!/[a-z]/.test(password)) {
      showError("La contraseña debe contener al menos una letra minúscula.");
      return;
    }

    // Validar número
    if (!/\d/.test(password)) {
      showError("La contraseña debe contener al menos un número.");
      return;
    }

    // Validar carácter especial
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;~`]/.test(password)) {
      showError("La contraseña debe contener al menos un carácter especial (!@#$%^&*(),.?\":{}|<>_-+=[]\\\/;~`).");
      return;
    }

    // Validar que las contraseñas coincidan
    if (password !== password2) {
      showError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const resp = await postResetPassword({ uid, token, new_password: password });
      if (resp.ok) {
        showSuccess("¡Contraseña cambiada correctamente! Ahora puedes iniciar sesión.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        const d = resp.data || {};
        const errorMsg = d.message || d.detail || "Error al cambiar la contraseña.";
        showError(errorMsg);
      }
    } catch {
      showError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <img src={require("../assets/logo.png")} alt="Logo" className="logo" />
      <div className="titulo-app">Restablecer Contraseña</div>

      <form className="input-group" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="new-password">Nueva contraseña</label>
            <div className="input-icon">
              <Lock className="input-icon-left" size={20} />
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={password}
                minLength={8}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="repeat-password">Repite la nueva contraseña</label>
            <div className="input-icon">
              <Lock className="input-icon-left" size={20} />
              <input
                id="repeat-password"
                type={showPassword2 ? "text" : "password"}
                placeholder="Repite la nueva contraseña"
                value={password2}
                minLength={8}
                onChange={(e) => setPassword2(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword2(!showPassword2)}
                aria-label={showPassword2 ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword2 ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

        <button className="btn-green" type="submit" disabled={loading}>
          {loading ? "Cambiando..." : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}
