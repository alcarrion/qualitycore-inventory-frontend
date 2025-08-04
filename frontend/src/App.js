// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import TransactionsPage from "./pages/TransactionsPage";
import ReportsPage from "./pages/ReportsPage";
import SuppliersPage from "./pages/SuppliersPage";
import CustomersPage from "./pages/CustomersPage";
import QuotationPage from "./pages/QuotationPage";
import ProfilePage from "./pages/ProfilePage";
import ResetPassword from "./pages/ResetPassword";
import UsersPage from "./pages/UsersPage";
import Layout from "./components/Layout";

function App() {
  // Inicializa el usuario desde localStorage, si existe
  const [usuario, setUsuario] = useState(() =>
    JSON.parse(localStorage.getItem("user")) || null
  );

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUsuario(null);
    window.location.href = "/";
  };

  const handleShowPerfil = () => {
    window.location.href = "/profile";
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage setUsuario={setUsuario} />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Solo muestra el layout si hay usuario autenticado */}
        <Route
          element={
            usuario ? (
              <Layout
                user={usuario}
                onLogout={handleLogout}
                onShowPerfil={handleShowPerfil}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<InventoryPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/quotation" element={<QuotationPage />} />
          <Route path="/profile" element={<ProfilePage user={usuario} />} />
          <Route path="/users" element={<UsersPage user={usuario} />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
