// src/pages/UsersPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Modal from "../components/Modal";
import { AddUserForm } from "../components/AddUserForm";
import { useApp } from "../contexts/AppContext";
import { PERMISSIONS, isAdmin as checkIsAdmin, isSuperAdmin as checkIsSuperAdmin } from "../constants/roles";
import { ERRORS, SUCCESS } from "../constants/messages";
import { extractFormErrors } from "../utils/errorHandler";
import { setStoredUser } from "../services/authService";
import "../styles/pages/UsersPage.css";
import { getUsers, patchUser } from "../services/api";
import { translateRole } from "../utils/translateRole";
import { logger } from "../utils/logger";
import { useAbortSignal } from "../hooks/useAbortSignal";
import type { User, UserRole } from "../types/models";
import type { LayoutContext } from "../types/context";

export default function UsersPage() {
  const { user } = useOutletContext<LayoutContext>();
  const { showSuccess, showError } = useApp();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [sort, setSort] = useState("-id");

  const role = user?.role || "";
  const isAdmin = checkIsAdmin(role);
  const isSuperAdmin = checkIsSuperAdmin(role);
  const canAddUser = PERMISSIONS.CAN_ADD_USER(role);
  const getSignal = useAbortSignal();

  useEffect(() => {
    if (!isAdmin) navigate("/dashboard", { replace: true });
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const signal = getSignal();
    (async () => {
      try {
        const res = await getUsers(sort, { signal });
        if ((res as { aborted?: boolean }).aborted) return;
        const usersList = (res.data as { results?: User[] } | null)?.results ?? (Array.isArray(res.data) ? res.data as User[] : []);
        setUsers(usersList);

        const userInList = usersList.find(u => u.id === user?.id);
        if (userInList && userInList.role !== user?.role) {
          const updatedUser = { ...user, role: userInList.role };
          setStoredUser(updatedUser);
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        logger.error("Error al cargar usuarios:", error);
        showError(ERRORS.LOAD_FAILED('los usuarios'));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, showAdd, showError, sort]);

  const handleChangeRole = async (userId: number, newRole: UserRole) => {
    try {
      setLoadingId(userId);
      const resp = await patchUser(userId, { role: newRole });
      if (!resp.ok) {
        throw new Error(extractFormErrors(resp.data, ERRORS.UPDATE_FAILED('el rol')));
      }
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
      showSuccess(SUCCESS.UPDATED('Rol'));
    } catch (e) {
      showError((e as Error).message || ERRORS.UPDATE_FAILED('el rol'));
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleActive = async (userId: number, isActive: boolean | undefined) => {
    try {
      setLoadingId(userId);
      const resp = await patchUser(userId, { is_active: !isActive });
      if (!resp.ok) {
        throw new Error(extractFormErrors(resp.data, ERRORS.UPDATE_FAILED('el estado')));
      }
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, is_active: !isActive } : u)));
      showSuccess(`Usuario ${!isActive ? "activado" : "inactivado"} correctamente.`);
    } catch (e) {
      showError((e as Error).message || ERRORS.UPDATE_FAILED('el estado'));
    } finally {
      setLoadingId(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="users-page-container">
      <div className="users-page-header">
        <h2>USUARIOS</h2>
        {canAddUser && (
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            Añadir Usuario
          </button>
        )}
      </div>

      <div className="users-sort">
        <label>Ordenar:</label>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="-id">Lo nuevo</option>
          <option value="name">Nombre A → Z</option>
          <option value="-name">Nombre Z → A</option>
        </select>
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
                {user.id !== u.id && (isSuperAdmin || u.role === "User") ? (
                  <select
                    value={u.role}
                    onChange={(e) => handleChangeRole(u.id, e.target.value as UserRole)}
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
                {user.id !== u.id && (isSuperAdmin || u.role === "User") ? (
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
