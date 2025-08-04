// src/pages/ResetPassword.js
import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, CheckCircle2 } from "lucide-react";
import "../styles/pages/ResetPassword.css"; 

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== password2) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);

    const response = await fetch("http://localhost:8000/api/productos/reset-password/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, token, new_password: password }),
    });
    const data = await response.json();

    if (response.ok) {
      setMessage("¡Contraseña cambiada correctamente! Ahora puedes iniciar sesión.");
      setTimeout(() => navigate("/"), 2000);
    } else {
      setMessage(data.message || "Error al cambiar la contraseña.");
    }
    setLoading(false);
  };

  if (!uid || !token) {
    return (
      <div className="login-container">
        <div className="card" style={{ margin: 60 }}>
          El enlace no es válido o ha expirado.
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <form className="card input-group" onSubmit={handleSubmit}>
        <img src={require("../assets/logo.png")} alt="Logo" className="logo" />
        <div className="titulo-app">Restablecer Contraseña</div>

        <label htmlFor="new-password">Nueva contraseña</label>
        <div className="input-icon">
          <Lock className="input-icon-left" size={20} />
          <input
            id="new-password"
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            minLength={6}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <label htmlFor="repeat-password">Repite la nueva contraseña</label>
        <div className="input-icon">
          <Lock className="input-icon-left" size={20} />
          <input
            id="repeat-password"
            type="password"
            placeholder="Repite la nueva contraseña"
            value={password2}
            minLength={6}
            onChange={e => setPassword2(e.target.value)}
            required
          />
        </div>

        <button className="btn-green" type="submit" disabled={loading}>
          {loading ? "Cambiando..." : "Cambiar contraseña"}
        </button>
        {message && (
          <div className="message" style={{ color: message.includes("correctamente") ? "#238c0c" : undefined }}>
            {message.includes("correctamente") && <CheckCircle2 size={18} style={{marginRight: 5, verticalAlign: "middle"}} />}
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
