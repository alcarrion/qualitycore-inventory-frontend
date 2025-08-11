// src/pages/DashboardPage.js
import React, { useState, useEffect } from "react";
import UserProfile from "../components/UserProfile";
import Modal from "../components/Modal";
import EditProfileForm from "../components/EditProfileForm";
import { ChangePasswordForm } from "../components/ChangePasswordForm";
import { AddUserForm } from "../components/AddUserForm";
import { Package, DollarSign, Users, Activity, Bell } from "lucide-react";
import { getAlertas, dismissAlerta, getDashboardSummary } from "../services/api"; // ✅ wrappers
import "../styles/pages/DashboardPage.css";

export default function DashboardPage() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || { name: "Usuario", role: "Sin rol" }
  );
  const [showProfile, setShowProfile] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [alertas, setAlertas] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const [dashboardData, setDashboardData] = useState({
    total_products: 0,
    total_customers: 0,
    total_movements: 0,
    total_entries: 0,
    total_exits: 0,
    low_stock_alerts: 0,
    total_sales: 0,
  });

  useEffect(() => {
    fetchAlertas();
    fetchDashboard();
  }, []);

  const fetchAlertas = async () => {
    const res = await getAlertas();                 // { ok, status, data }
    setAlertas(Array.isArray(res.data) ? res.data : []);
  };

  const fetchDashboard = async () => {
    const res = await getDashboardSummary();        // { ok, status, data }
    if (res.ok && res.data) setDashboardData(res.data);
    // opcional: si res.status === 401 → redirigir a login
  };

  const cerrarAlerta = async (id) => {
    const res = await dismissAlerta(id);            // { ok, status, data }
    if (res.ok) {
      setAlertas(prev => prev.filter(a => a.id !== id));
      setMensaje(res.data?.message || "✅ Alerta cerrada correctamente");
    } else {
      setMensaje("❌ No se pudo cerrar la alerta");
    }
    setTimeout(() => setMensaje(""), 4000);
  };

  const handleSaveEdit = (data) => {
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    setShowEdit(false);
  };

  const stats = [
    { icon: <Package size={32} color="#3475eb" />, color: "#e6eeff", value: dashboardData.total_products, label: "Productos Totales" },
    { icon: <DollarSign size={32} color="#34cb74" />, color: "#e6fbe7", value: dashboardData.total_sales, label: "Ventas Totales" },
    { icon: <Users size={32} color="#9057ff" />, color: "#efeaff", value: dashboardData.total_customers, label: "Clientes Registrados" },
    { icon: <Activity size={32} color="#ff9900" />, color: "#fff5e6", value: dashboardData.total_movements, label: "Movimientos Totales" },
    { icon: <Activity size={32} color="#28a745" />, color: "#e6f9ec", value: dashboardData.total_entries, label: "Entradas" },
    { icon: <Activity size={32} color="#dc3545" />, color: "#fdecea", value: dashboardData.total_exits, label: "Salidas" },
    { icon: <Bell size={32} color="#ffc107" />, color: "#fffbe6", value: dashboardData.low_stock_alerts, label: "Alertas de Stock" },
  ];

  return (
    <div className="dashboard-root">
      <main className="dashboard-main">
        {mensaje && (
          <div className={`mensaje ${mensaje.startsWith("✅") ? "mensajeOk" : "mensajeError"}`}>
            {mensaje}
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
                  <div className="dashboard-card-icon" style={{ background: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="dashboard-card-info">
                    <div className="dashboard-card-value">{stat.value}</div>
                    <div className="dashboard-card-label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="dashboard-widget">
              <div className="dashboard-widget-title">🔔 Alertas de Bajo Stock</div>
              {alertas.length > 0 ? (
                <ul className="dashboard-alert-list">
                  {alertas.map((alerta) => (
                    <li key={alerta.id} className="dashboard-alert-item">
                      <div>
                        <strong>{alerta.product_name}:</strong> {alerta.message}
                      </div>
                      <button
                        onClick={() => cerrarAlerta(alerta.id)}
                        className="dashboard-alert-dismiss"
                      >
                        Ocultar
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "#888", marginTop: "1rem" }}>
                  No hay alertas activas. Todo el stock está en buen estado 👍
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
