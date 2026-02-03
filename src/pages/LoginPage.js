// src/pages/LoginPage.js
import React, { useEffect, useState } from "react";
import LoginForm from "../components/LoginForm";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import { useNavigate } from "react-router-dom";
import { initCsrf } from "../services/api";
import { useApp } from "../contexts/AppContext";
import "../styles/pages/LoginPage.css";

export default function LoginPage({ setUser }) {
  const { showSuccess, showError } = useApp();
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initCsrf();
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (u) navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="login-container">
      <div className="login-header">
        <img
          src={require("../assets/logo.png")}
          alt="Logo"
          className="logo"
        />
        <div className="titulo-app">
          SISTEMA DE GESTIÓN<br />DE INVENTARIOS
        </div>
      </div>

      {!showForgot ? (
        <>
          <LoginForm
            navigate={navigate}
            setUser={setUser}
            showSuccess={showSuccess}
            showError={showError}
          />
          <span className="link" onClick={() => setShowForgot(true)}>
            ¿Olvidaste tu contraseña?
          </span>
        </>
      ) : (
        <>
          <ForgotPasswordForm
            showSuccess={showSuccess}
            showError={showError}
          />
          <span className="link" onClick={() => setShowForgot(false)}>
            Volver a iniciar sesión
          </span>
        </>
      )}
    </div>
  );
}
