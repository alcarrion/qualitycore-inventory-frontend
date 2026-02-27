// src/components/UserProfile.tsx
import React from "react";
import { Moon, Sun } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import type { User } from "../types/models";
import "../App.css";
import "../styles/pages/ProfilePage.css";

interface Props {
  user: User | null;
  onClose?: () => void;
  onEditProfile?: () => void;
  onChangePassword?: () => void;
  onAddUser?: () => void;
}

export default function UserProfile({ user, onClose, onEditProfile, onChangePassword, onAddUser }: Props) {
  const { darkMode, toggleDarkMode } = useApp();

  const translateRole = (role: string | undefined): string => {
    switch (role) {
      case "SuperAdmin": return "Super Administrador";
      case "Administrator": return "Administrador";
      case "User": return "Usuario";
      default: return role ?? "";
    }
  };

  return (
    <div className="profile-container">
      <h2>Mi Perfil</h2>
      <div className="profile-info">
        <div className="profile-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
        <div><strong>Nombre:</strong> {user?.name}</div>
        <div><strong>Correo:</strong> {user?.email}</div>
        <div><strong>Teléfono:</strong> {user?.phone}</div>
        <div><strong>ROL:</strong> {translateRole(user?.role)}</div>
      </div>
      <div className="profile-actions">
        <button className="btn-edit-profile" onClick={onEditProfile}>EDITAR PERFIL</button>
        <button className="btn-change-password" onClick={onChangePassword}>CAMBIAR CONTRASEÑA</button>
      </div>

      <div className="dark-mode-toggle">
        <span className="toggle-label">Modo Oscuro</span>
        <button className="toggle-button" onClick={toggleDarkMode} aria-label="Toggle dark mode">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
}
