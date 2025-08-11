// src/components/LoginForm.js
import React, { useState } from "react";
import { loginUser } from "../services/api";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import "../styles/pages/LoginPage.css";

export default function LoginForm({ setMessage, navigate, setUsuario }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const result = await loginUser(email, password); // { ok, status, data }
      const user = result?.data?.user;
      const msg  = result?.data?.message;

      setMessage(
        msg ||
        (result.ok
          ? "Sesión iniciada"
          : result.status === 401
            ? "Credenciales inválidas"
            : "No se pudo iniciar sesión")
      );

      if (result.ok && user) {
        localStorage.setItem("user", JSON.stringify(user));
        setUsuario(user);
        navigate("/dashboard");
      }
    } catch {
      setMessage("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="input-group">
      <label htmlFor="email">Correo electrónico</label>
      <div className="input-icon">
        <Mail className="input-icon-left" size={20} />
        <input
          id="email"
          type="email"
          placeholder="Ingresa tu correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <label htmlFor="password">Contraseña</label>
      <div className="input-icon">
        <Lock className="input-icon-left" size={20} />
        <input
          id="password"
          type={showPass ? "text" : "password"}
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <span
          className="input-icon-right"
          onClick={() => setShowPass(!showPass)}
          tabIndex={0}
          style={{ cursor: "pointer" }}
        >
          {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
        </span>
      </div>

      <button className="btn-green" type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
