// src/components/ForgotPasswordForm.tsx
import React, { useState } from "react";
import { forgotPassword } from "../services/api";
import { Mail } from "lucide-react";
import { ERRORS, SUCCESS } from "../constants/messages";
import "../styles/components/Form.css";

interface Props {
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

export default function ForgotPasswordForm({ showSuccess, showError }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await forgotPassword(email);
      const msg = (result.data as { message?: string } | null)?.message;

      if (result.ok || msg?.includes("éxito") || msg?.includes("enviado")) {
        showSuccess(msg || SUCCESS.RECOVERY_EMAIL_SENT);
      } else {
        showError(msg || ERRORS.RECOVERY_EMAIL_FAILED);
      }
    } catch {
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
