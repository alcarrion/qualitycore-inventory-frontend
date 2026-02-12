// src/components/Layout.js
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import "../styles/components/Layout.css";

export default function Layout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="layout-root">
      {/* Overlay backdrop para cerrar sidebar - DEBE IR ANTES del sidebar */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      <Sidebar
        user={user}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Botón hamburguesa para móvil */}
      <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle menu">
        <Menu size={24} />
      </button>

      <main className="layout-main">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}
