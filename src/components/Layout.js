// src/components/Layout.js
import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout({ user, onLogout, onShowPerfil }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar user={user} onLogout={onLogout} onShowPerfil={onShowPerfil} />
      <main style={{ flex: 1, background: "#f7f7f9", padding: 32, paddingLeft: 240 }}>
        <Outlet />
      </main>
    </div>
  );
}
