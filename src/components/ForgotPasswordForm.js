// src/components/ForgotPasswordForm.js
import React, { useState } from "react";
import { forgotPassword } from "../services/api";
import { Mail } from "lucide-react";
import { ERRORS, SUCCESS } from "../constants/messages";
import "../styles/components/Form.css";


export default function ForgotPasswordForm({ showSuccess, showError }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.ok || result.message?.includes("éxito") || result.message?.includes("enviado")) {
        showSuccess(result.message || SUCCESS.RECOVERY_EMAIL_SENT);
      } else {
        showError(result.message || ERRORS.RECOVERY_EMAIL_FAILED);
      }
    } catch (error) {
      showError(ERRORS.REQUEST_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleForgot} className="input-group">
      <label htmlFor="recover-email">Correo electrónico</label>
      <div className="input-icon">
        <Mail className="input-icon-left" size={20} />
        <input
          id="recover-email"
          type="email"
          placeholder="Ingresa tu correo"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <button className="btn-green" type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Recuperar contraseña"}
      </button>
    </form>
  );
}
