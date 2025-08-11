// src/components/Sidebar.js
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Box, BarChart2, Users,
  User, DollarSign, Truck, LogOut
} from "lucide-react";
import "../styles/components/Sidebar.css";

export default function Sidebar({ user, onLogout, onShowPerfil }) {
  const traducirRol = (rol) => {
    switch (rol?.toLowerCase()) {
      case "administrator":
        return "Administrador";
      case "user":
        return "Usuario";
      default:
        return rol;
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={require("../assets/logo.png")} alt="Logo" />
        <span>
          CoreQuality<br />
          <span className="sidebar-sub">Services</span>
        </span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/products"><Box size={20} /> Inventario</NavLink>
        <NavLink to="/transactions"><Truck size={20} /> Movimientos</NavLink>
        <NavLink to="/reports"><BarChart2 size={20} /> Reportes</NavLink>
        <NavLink to="/suppliers"><Users size={20} /> Proveedores</NavLink>
        <NavLink to="/customers"><User size={20} /> Clientes</NavLink>
        <NavLink to="/quotation"><DollarSign size={20} /> Cotización</NavLink>

        {/* Solo el administrador puede ver esto */}
        {user?.role === "Administrator" && (
          <NavLink to="/users"><Users size={20} /> Usuarios</NavLink>
        )}
      </nav>

      <div style={{ flex: 4 }} />

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
            {traducirRol(user?.role) || "Sin rol"}
          </div>
        </div>
        <button className="sidebar-logout" onClick={onLogout}>
          <LogOut size={18} style={{ marginRight: 8 }} /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
