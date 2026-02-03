// src/App.js
import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./contexts/AppContext";
import { setToastHandler } from "./utils/errorHandler";
import Layout from "./components/Layout";
import ToastContainer from "./components/ToastContainer";
import LoadingSpinner from "./components/LoadingSpinner";

// ===== LAZY LOADING DE PÁGINAS =====
// Las páginas se cargan bajo demanda para mejorar el tiempo de carga inicial
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const InventoryPage = lazy(() => import("./pages/InventoryPage"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const SuppliersPage = lazy(() => import("./pages/SuppliersPage"));
const CustomersPage = lazy(() => import("./pages/CustomersPage"));
const QuotationPage = lazy(() => import("./pages/QuotationPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const UsersPage = lazy(() => import("./pages/UsersPage"));

function AppContent() {
  const { toasts, removeToast, isLoading, addToast } = useApp();
  // Inicializa el usuario desde localStorage, si existe
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user")) || null
  );

  // Inicializar el error handler con la función de toast
  useEffect(() => {
    setToastHandler(addToast);
  }, [addToast]);

  // Escuchar cambios en localStorage para actualizar el usuario
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      if (updatedUser) {
        setUser(updatedUser);
      }
    };

    // Escuchar evento de storage (solo funciona entre pestañas)
    window.addEventListener("storage", handleStorageChange);

    // Crear evento personalizado para cambios en la misma pestaña
    window.addEventListener("userUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userUpdated", handleStorageChange);
    };
  }, []);

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const handleShowPerfil = () => {
    window.location.href = "/profile";
  };

  return (
    <>
      {/* Container de toasts - Muestra las notificaciones */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Resto de la aplicación */}
      <Router>
        <Suspense fallback={<LoadingSpinner fullScreen message="Cargando página..." />}>
          <Routes>
            <Route path="/" element={<LoginPage setUser={setUser} />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Solo muestra el layout si hay usuario autenticado */}
            <Route
              element={
                user ? (
                  <Layout
                    user={user}
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
              <Route path="/profile" element={<ProfilePage user={user} />} />
              <Route path="/users" element={<UsersPage user={user} />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
}

// Componente principal que envuelve todo con el AppProvider
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
