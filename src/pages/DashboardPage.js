// src/pages/DashboardPage.js
import React, { useState, useMemo, useCallback } from "react";
import UserProfile from "../components/UserProfile";
import Modal from "../components/Modal";
import EditProfileForm from "../components/EditProfileForm";
import { ChangePasswordForm } from "../components/ChangePasswordForm";
import { AddUserForm } from "../components/AddUserForm";
import { Package, DollarSign, Users, Activity, Bell, AlertTriangle, XCircle, AlertOctagon, CheckCircle2 } from "lucide-react";
import { dismissAlert } from "../services/api";
import { useDashboardData } from "../hooks/useDashboardData";
import "../styles/pages/DashboardPage.css";

export default function DashboardPage() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || { name: "Usuario", role: "Sin rol" }
  );
  const [showProfile, setShowProfile] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const { alerts, setAlerts, dashboardData, loading: loadingAlerts } = useDashboardData();
  const [message, setMessage] = useState("");

  const dismissAlertHandler = useCallback(async (id) => {
    const res = await dismissAlert(id);
    if (res.ok) {
      setAlerts(prev => prev.filter(a => a.id !== id));
      setMessage(res.data?.message || "✅ Alerta cerrada correctamente");
    } else {
      setMessage("❌ No se pudo cerrar la alerta");
    }
    setTimeout(() => setMessage(""), 4000);
  }, []);

  const handleSaveEdit = useCallback((data) => {
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    setShowEdit(false);
  }, []);

  // ✅ Optimización: useMemo para evitar recrear array en cada render
  const stats = useMemo(() => [
    { icon: <Package size={24} />, value: dashboardData.total_products, label: "Productos Totales" },
    { icon: <DollarSign size={24} />, value: dashboardData.total_sales, label: "Ventas Totales" },
    { icon: <Users size={24} />, value: dashboardData.total_customers, label: "Clientes Registrados" },
    { icon: <Activity size={24} />, value: dashboardData.total_movements, label: "Movimientos Totales" },
    { icon: <Activity size={24} />, value: dashboardData.total_entries, label: "Entradas" },
    { icon: <Activity size={24} />, value: dashboardData.total_exits, label: "Salidas" },
    { icon: <Bell size={24} />, value: dashboardData.low_stock_alerts, label: "Alertas de Stock" },
  ], [dashboardData]);

  return (
    <div className="dashboard-root">
      <main className="dashboard-main">
        {message && (
          <div className={`mensaje ${message.startsWith("✅") ? "mensajeOk" : "mensajeError"}`}>
            {message}
          </div>
        )}

        {showProfile ? (
          <>
            <UserProfile
              user={user}
              onClose={() => setShowProfile(false)}
              onEditProfile={() => setShowEdit(true)}
              onChangePassword={() => setShowPass(true)}
              onAddUser={() => setShowAdd(true)}
            />
            {showEdit && (
              <Modal onClose={() => setShowEdit(false)}>
                <EditProfileForm
                  user={user}
                  onSave={handleSaveEdit}
                  onCancel={() => setShowEdit(false)}
                />
              </Modal>
            )}
            {showPass && (
              <Modal onClose={() => setShowPass(false)}>
                <ChangePasswordForm
                  onSave={() => setShowPass(false)}
                  onCancel={() => setShowPass(false)}
                />
              </Modal>
            )}
            {showAdd && (
              <Modal onClose={() => setShowAdd(false)}>
                <AddUserForm
                  onSave={() => setShowAdd(false)}
                  onCancel={() => setShowAdd(false)}
                />
              </Modal>
            )}
          </>
        ) : (
          <>
            <div className="dashboard-header">
              <div>
                <h1>
                  Bienvenido/a, <span className="dashboard-user">{user?.name}</span>
                </h1>
                <div className="dashboard-sub">Gestiona tu inventario de manera eficiente</div>
              </div>
            </div>

            <div className="dashboard-stats">
              {stats.map((stat, i) => (
                <div className="dashboard-card" key={i}>
                  <div className="dashboard-card-content">
                    <div className="dashboard-card-header">
                      <div className="dashboard-card-icon">
                        {stat.icon}
                      </div>
                      <div className="dashboard-card-label">{stat.label}</div>
                    </div>
                    <div className="dashboard-card-value">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="dashboard-widget">
              <div className="dashboard-widget-title">
                <Bell size={24} style={{ marginRight: "8px", verticalAlign: "middle" }} />
                Alertas de Bajo Stock
              </div>
              {loadingAlerts ? (
                <div className="dashboard-alert-loading">
                  Cargando alertas...
                </div>
              ) : alerts.length > 0 ? (
                <ul className="dashboard-alert-list">
                  {alerts.map((alert) => {
                    // Determinar icono según tipo de alerta
                    const getAlertIcon = (type) => {
                      switch(type) {
                        case 'out_of_stock':
                          return <XCircle size={20} />;
                        case 'one_unit':
                          return <AlertOctagon size={20} />;
                        case 'low_stock':
                          return <AlertTriangle size={20} />;
                        default:
                          return <AlertTriangle size={20} />;
                      }
                    };

                    return (
                      <li key={alert.id} className={`dashboard-alert-item alert-${alert.type}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {getAlertIcon(alert.type)}
                          <span>
                            <strong>{alert.product_name}:</strong> {alert.message}
                          </span>
                        </div>
                        <button
                          onClick={() => dismissAlertHandler(alert.id)}
                          className="dashboard-alert-dismiss"
                        >
                          Ocultar
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="dashboard-alert-empty">
                  <CheckCircle2 size={20} />
                  <span>No hay alertas activas. Todo el stock está en buen estado</span>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
