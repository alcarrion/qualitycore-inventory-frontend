// src/pages/UsersPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { AddUserForm } from "../components/AddUserForm";
import { useApp } from "../contexts/AppContext";
import "../styles/pages/UsersPage.css";
import { getUsers, patchUser } from "../services/api";
import { translateRole } from "../utils/translateRole";

export default function UsersPage({ user }) {
  const { showSuccess, showError } = useApp();
  const currentUser = user || JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const isAdmin = currentUser?.role === "Administrator" || currentUser?.role === "SuperAdmin";
  const isSuperAdmin = currentUser?.role === "SuperAdmin";

  useEffect(() => {
    if (!isAdmin) navigate("/dashboard", { replace: true });
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const res = await getUsers();
        // El backend devuelve paginación: { count, next, previous, results: [...] }
        // Extraemos el array de usuarios desde "results"
        const usersList = res.data?.results || res.data || [];
        setUsers(Array.isArray(usersList) ? usersList : []);

        // Actualizar localStorage si el usuario actual está en la lista
        const currentUserInList = usersList.find(u => u.id === currentUser?.id);
        if (currentUserInList && currentUserInList.role !== currentUser?.role) {
          const updatedUser = { ...currentUser, role: currentUserInList.role };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          // Disparar evento personalizado para que App.js actualice el estado
          window.dispatchEvent(new Event("userUpdated"));
        }
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        showError("Error al cargar la lista de usuarios. Por favor, intenta nuevamente.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, showAdd, showError]);

  const handleChangeRole = async (userId, newRole) => {
    try {
      setLoadingId(userId);
      const resp = await patchUser(userId, { role: newRole });
      if (!resp.ok) {
        const errorMsg = resp.data?.role?.[0] || resp.data?.detail || "Error cambiando rol";
        throw new Error(errorMsg);
      }
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
      showSuccess("Rol actualizado correctamente.");
    } catch (e) {
      showError(e.message || "No se pudo cambiar el rol");
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      setLoadingId(userId);
      const resp = await patchUser(userId, { is_active: !isActive });
      if (!resp.ok) {
        const errorMsg = resp.data?.detail || resp.data?.non_field_errors?.[0] || "Error cambiando estado";
        throw new Error(errorMsg);
      }
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, is_active: !isActive } : u)));
      showSuccess(`Usuario ${!isActive ? "activado" : "inactivado"} correctamente.`);
    } catch (e) {
      showError(e.message || "No se pudo cambiar el estado");
    } finally {
      setLoadingId(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="users-page-container">
      <div className="users-page-header">
        <h2>USUARIOS</h2>
        {isSuperAdmin && (
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            Añadir Usuario
          </button>
        )}
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
                {currentUser.id !== u.id && (isSuperAdmin || u.role === "User") ? (
                  <select
                    value={u.role}
                    onChange={(e) => handleChangeRole(u.id, e.target.value)}
                    disabled={loadingId === u.id}
                  >
                    <option value="User">Usuario</option>
                    <option value="Administrator">Administrador</option>
                    {isSuperAdmin && <option value="SuperAdmin">Super Administrador</option>}
                  </select>
                ) : (
                  translateRole(u.role)
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
                {currentUser.id !== u.id && (isSuperAdmin || u.role === "User") ? (
                  <button
                    className="btn-secondary"
                    onClick={() => handleToggleActive(u.id, u.is_active)}
                    disabled={loadingId === u.id}
                  >
                    {u.is_active ? "Inactivar" : "Activar"}
                  </button>
                ) : (
                  <span style={{ color: "var(--text-secondary)", fontStyle: "italic", fontSize: "var(--font-size-sm)" }}>
                    No puedes modificar <br></br> tu propia cuenta
                  </span>
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
