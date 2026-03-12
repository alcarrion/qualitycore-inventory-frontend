// src/pages/DashboardPage.tsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import UserProfile from "../components/UserProfile";
import Modal from "../components/Modal";
import EditProfileForm from "../components/EditProfileForm";
import { ChangePasswordForm } from "../components/ChangePasswordForm";
import { AddUserForm } from "../components/AddUserForm";
import { Package, DollarSign, Users, Activity, Bell, AlertTriangle, XCircle, AlertOctagon, CheckCircle2 } from "lucide-react";
import { dismissAlert } from "../services/api";
import { useMasterDataStore } from "../store/masterDataStore";
import { SUCCESS, ERRORS } from "../constants/messages";
import { TIMEOUTS } from "../constants/config";
import { setStoredUser } from "../services/authService";
import type { User } from "../types/models";
import type { LayoutContext } from "../types/context";
import "../styles/pages/DashboardPage.css";

export default function DashboardPage() {
  const { user: contextUser } = useOutletContext<LayoutContext>();
  const [user, setUser] = useState<User>(contextUser);
  const [showProfile, setShowProfile] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const alerts = useMasterDataStore(state => state.alerts);
  const setAlerts = useMasterDataStore(state => state.setAlerts);
  const dashboardData = useMasterDataStore(state => state.dashboardData);
  const fetchDashboard = useMasterDataStore(state => state.fetchDashboard);
  const fetchAlerts = useMasterDataStore(state => state.fetchAlerts);

  useEffect(() => {
    fetchDashboard();
    fetchAlerts();
  }, [fetchDashboard, fetchAlerts]);

  const [message, setMessage] = useState("");

  const dismissAlertHandler = useCallback(async (id: number) => {
    const res = await dismissAlert(id);
    if (res.ok) {
      setAlerts(alerts.filter(a => a.id !== id));
      setMessage((res.data as { message?: string } | null)?.message || SUCCESS.ALERT_DISMISSED);
    } else {
      setMessage(SUCCESS.ALERT_DISMISS_FAILED);
    }
    setTimeout(() => setMessage(""), TIMEOUTS.MESSAGE_DISPLAY);
  }, [alerts, setAlerts]);

  const handleSaveEdit = useCallback((data: unknown) => {
    setUser(data as User);
    setStoredUser(data as User);
    setShowEdit(false);
  }, []);

  const stats = useMemo(() => [
    { icon: <Package size={24} />, value: dashboardData.total_products, label: "Productos Totales" },
    { icon: <DollarSign size={24} />, value: dashboardData.total_sales, label: "Ventas Totales" },
    { icon: <Users size={24} />, value: dashboardData.total_customers, label: "Clientes Registrados" },
    { icon: <Activity size={24} />, value: dashboardData.total_movements, label: "Movimientos Totales" },
    { icon: <Activity size={24} />, value: dashboardData.total_entries, label: "Entradas" },
    { icon: <Activity size={24} />, value: dashboardData.total_exits, label: "Salidas" },
    { icon: <Bell size={24} />, value: dashboardData.low_stock_alerts, label: "Alertas de Stock" },
  ], [dashboardData]);

  const getAlertIcon = (type: string | undefined) => {
    switch (type) {
      case 'out_of_stock': return <XCircle size={20} />;
      case 'one_unit': return <AlertOctagon size={20} />;
      default: return <AlertTriangle size={20} />;
    }
  };

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
                <Bell size={24} />
                Alertas de Bajo Stock
              </div>
              {alerts.length > 0 ? (
                <ul className="dashboard-alert-list">
                  {alerts.map((alert) => (
                    <li key={alert.id} className={`dashboard-alert-item alert-${alert.type}`}>
                      <div>
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
                  ))}
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
