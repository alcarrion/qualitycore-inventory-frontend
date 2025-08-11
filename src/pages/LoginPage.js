// src/pages/LoginPage.js
import React, { useEffect, useState } from "react";
import LoginForm from "../components/LoginForm";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import { useNavigate } from "react-router-dom";
import { initCsrf } from "../services/api";  // ✅ usa wrapper
import "../styles/pages/LoginPage.css";

export default function LoginPage({ setUsuario }) {
  const [showForgot, setShowForgot] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Coloca la cookie csrftoken (si no la puso ya tu init global)
    initCsrf();
    // Si ya hay sesión, redirige
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (u) navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="login-container">
      <div className="card">
        <img
          src={require("../assets/logo.png")}
          alt="Logo"
          className="logo"
        />
        <div className="titulo-app">
          SISTEMA DE GESTIÓN<br />DE INVENTARIOS
        </div>

        {!showForgot ? (
          <>
            <LoginForm
              setMessage={setMessage}
              navigate={navigate}
              setUsuario={setUsuario}
            />
            <span className="link" onClick={() => setShowForgot(true)}>
              ¿Olvidaste tu contraseña?
            </span>
          </>
        ) : (
          <>
            <ForgotPasswordForm setMessage={setMessage} />
            <span className="link" onClick={() => setShowForgot(false)}>
              Volver a iniciar sesión
            </span>
          </>
        )}

        {message && <div className="message">{message}</div>}
      </div>
    </div>
  );
}
