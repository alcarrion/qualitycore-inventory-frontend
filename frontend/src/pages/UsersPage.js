// src/pages/UsersPage.js
import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { AddUserForm } from "../components/AddUserForm";
import { API_URL, getCookie } from "../services/api";
import "../styles/pages/UsersPage.css";

export default function UsersPage({ user }) {
  const currentUser = user || JSON.parse(localStorage.getItem("user"));
  const [users, setUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/users/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(() => setUsers([]));
  }, [showAdd]);

  const handleChangeRol = (userId, nuevoRol) => {
    setLoadingId(userId);
    fetch(`${API_URL}/users/${userId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      credentials: "include",
      body: JSON.stringify({ role: nuevoRol }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error cambiando rol");
        return res.json();
      })
      .then(() => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, role: nuevoRol } : u
          )
        );
      })
      .finally(() => setLoadingId(null));
  };

  const handleToggleActive = (userId, isActive) => {
    setLoadingId(userId);
    fetch(`${API_URL}/users/${userId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      credentials: "include",
      body: JSON.stringify({ is_active: !isActive }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error cambiando estado");
        return res.json();
      })
      .then(() => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, is_active: !isActive } : u
          )
        );
      })
      .finally(() => setLoadingId(null));
  };

  if (currentUser?.role !== "Administrator") {
    window.location.href = "/dashboard";
    return null;
  }

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
                ></span>
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
          <AddUserForm
            onSave={() => setShowAdd(false)}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}
    </div>
  );
}
