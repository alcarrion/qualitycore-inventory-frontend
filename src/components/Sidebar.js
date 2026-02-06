// src/components/Sidebar.js
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Box, BarChart2, Users,
  User, DollarSign, Truck, LogOut
} from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import { translateRole } from "../utils/translateRole";
import { PERMISSIONS } from "../constants/roles";
import { CONFIRM } from "../constants/messages";
import "../styles/components/Sidebar.css";

export default function Sidebar({ user, onLogout, onShowPerfil, isOpen, onClose }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const role = user?.role || "";
  const canViewUsers = PERMISSIONS.CAN_VIEW_USERS(role);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar-logo">
        <img src={require("../assets/logo.png")} alt="Logo" />
        <span>
          QualityCore<br />
          <span className="sidebar-sub">Services</span>
        </span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""} onClick={handleNavClick}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/transactions" onClick={handleNavClick}><Truck size={20} /> Movimientos</NavLink>
        <NavLink to="/products" onClick={handleNavClick}><Box size={20} /> Inventario</NavLink>
        <NavLink to="/suppliers" onClick={handleNavClick}><Users size={20} /> Proveedores</NavLink>
        <NavLink to="/customers" onClick={handleNavClick}><User size={20} /> Clientes</NavLink>
        <NavLink to="/quotation" onClick={handleNavClick}><DollarSign size={20} /> Cotización</NavLink>
        <NavLink to="/reports" onClick={handleNavClick}><BarChart2 size={20} /> Reportes</NavLink>

        {canViewUsers && (
          <NavLink to="/users" onClick={handleNavClick}><Users size={20} /> Usuarios</NavLink>
        )}
      </nav>

      <div style={{ flex: '1 1 auto' }} />

      <div className="sidebar-user">
        <div
          className="sidebar-user-info clickable"
          onClick={() => window.location.href = "/profile"}
          style={{ cursor: "pointer" }}
        >
          <div className="sidebar-user-avatar">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="sidebar-user-name">{user?.name || "Usuario"}</div>
          <div className="sidebar-user-role">
            {translateRole(user?.role) || "Sin rol"}
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout} title="Cerrar Sesión">
          <LogOut size={20} />
        </button>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={onLogout}
        title="Cerrar Sesión"
        message={CONFIRM.LOGOUT}
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        type="warning"
      />
    </aside>
  );
}
