// src/pages/UsersPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { AddUserForm } from "../components/AddUserForm";
import "../styles/pages/UsersPage.css";

// ✅ wrappers del servicio
import { getUsers, patchUser } from "../services/api";

export default function UsersPage({ user }) {
  const currentUser = user || JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const isAdmin = currentUser?.role === "Administrator";

  // 🔁 Redirigir si NO es admin (el hook SIEMPRE se llama)
  useEffect(() => {
    if (!isAdmin) navigate("/dashboard", { replace: true });
  }, [isAdmin, navigate]);

  // 📥 Cargar usuarios (el hook SIEMPRE se llama; salimos si no es admin)
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const res = await getUsers(); // { ok, status, data }
      setUsers(Array.isArray(res.data) ? res.data : []);
    })();
  }, [isAdmin, showAdd]);

  const handleChangeRol = async (userId, nuevoRol) => {
    try {
      setLoadingId(userId);
      const resp = await patchUser(userId, { role: nuevoRol });
      if (!resp.ok) throw new Error(resp.data?.detail || "Error cambiando rol");
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: nuevoRol } : u)));
    } catch (e) {
      alert(e.message || "No se pudo cambiar el rol");
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      setLoadingId(userId);
      const resp = await patchUser(userId, { is_active: !isActive });
      if (!resp.ok) throw new Error(resp.data?.detail || "Error cambiando estado");
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, is_active: !isActive } : u)));
    } catch (e) {
      alert(e.message || "No se pudo cambiar el estado");
    } finally {
      setLoadingId(null);
    }
  };

  // 👇 Este return condicional ya es seguro porque los hooks están arriba
  if (!isAdmin) return null;

  return (
    <div className="users-page-container">
      <div className="users-page-header">
        <h2>Usuarios</h2>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          Añadir Usuario
        </button>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", color: "#888", padding: "40px 0" }}>
                No hay usuarios registrados.
              </td>
            </tr>
          )}
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>
                {currentUser.id !== u.id ? (
                  <select
                    value={u.role}
                    onChange={(e) => handleChangeRol(u.id, e.target.value)}
                    disabled={loadingId === u.id}
                  >
                    <option value="User">Usuario</option>
                    <option value="Administrator">Administrador</option>
                  </select>
                ) : (
                  u.role
                )}
              </td>
              <td>
                <span
                  style={{
                    display: "inline-block",
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    background: u.is_active ? "#41d1a7" : "#ff8787",
                    marginRight: 8,
                    border: "1.5px solid #eee",
                    verticalAlign: "middle",
                  }}
                />
                {u.is_active ? "Activo" : "Inactivo"}
              </td>
              <td>
                {currentUser.id !== u.id ? (
                  <button
                    className="btn-secondary"
                    onClick={() => handleToggleActive(u.id, u.is_active)}
                    disabled={loadingId === u.id}
                  >
                    {u.is_active ? "Inactivar" : "Activar"}
                  </button>
                ) : (
                  <span>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <AddUserForm onSave={() => setShowAdd(false)} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}
    </div>
  );
}
