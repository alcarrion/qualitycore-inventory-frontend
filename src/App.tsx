// src/App.tsx
import React, { useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./contexts/AppContext";
import { setToastHandler } from "./utils/errorHandler";
import { useBootstrap } from "./hooks/useBootstrap";
import { useAppInit } from "./hooks/useAppInit";
import Layout from "./components/Layout";
import ToastContainer from "./components/ToastContainer";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorBoundary from "./components/ErrorBoundary";
import type { User } from "./types/models";

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
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));

function AppContent() {
  const { toasts, removeToast, addToast } = useApp();
  const { fetchAll, configError } = useBootstrap();
  const { user, setUser, sessionValidated, handleLogout } = useAppInit();

  // Inicializar el error handler con la función de toast
  useEffect(() => {
    setToastHandler(addToast);
  }, [addToast]);

  // Cargar datos globales cuando el usuario está autenticado y la sesión ha sido validada
  useEffect(() => {
    if (!user || !sessionValidated) return;
    const controller = new AbortController();
    fetchAll(controller.signal);
    return () => controller.abort();
  }, [user, sessionValidated, fetchAll]);

  // Avisar al usuario si la configuración del servidor no pudo cargarse
  useEffect(() => {
    if (configError && user) {
      addToast('warning', configError);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Intencional: addToast es estable pero incluirla como dep causaría que el
  // toast se muestre de nuevo si la referencia se recrea. Solo queremos
  // reaccionar cuando cambia configError (de null → mensaje o viceversa).
  }, [configError]);

  return (
    <>
      {/* Container de toasts - Muestra las notificaciones */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Resto de la aplicación */}
      <Router>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner fullScreen message="Cargando página..." />}>
            <Routes>
            <Route path="/" element={<LoginPage setUser={(u: User) => setUser(u)} />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Solo muestra el layout si hay usuario autenticado */}
            <Route
              element={
                user ? (
                  <Layout
                    user={user}
                    onLogout={handleLogout}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            >
              <Route path="/dashboard" element={<ErrorBoundary message="Error al cargar el dashboard."><DashboardPage /></ErrorBoundary>} />
              <Route path="/products" element={<ErrorBoundary message="Error al cargar el inventario."><InventoryPage /></ErrorBoundary>} />
              <Route path="/transactions" element={<ErrorBoundary message="Error al cargar las transacciones."><TransactionsPage /></ErrorBoundary>} />
              <Route path="/reports" element={<ErrorBoundary message="Error al cargar los reportes."><ReportsPage /></ErrorBoundary>} />
              <Route path="/suppliers" element={<ErrorBoundary message="Error al cargar los proveedores."><SuppliersPage /></ErrorBoundary>} />
              <Route path="/customers" element={<ErrorBoundary message="Error al cargar los clientes."><CustomersPage /></ErrorBoundary>} />
              <Route path="/quotation" element={<ErrorBoundary message="Error al cargar las cotizaciones."><QuotationPage /></ErrorBoundary>} />
              <Route path="/profile" element={<ErrorBoundary message="Error al cargar el perfil."><ProfilePage /></ErrorBoundary>} />
              <Route path="/users" element={<ErrorBoundary message="Error al cargar los usuarios."><UsersPage /></ErrorBoundary>} />
              <Route path="/categories" element={<ErrorBoundary message="Error al cargar las categorías."><CategoriesPage /></ErrorBoundary>} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
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
