// ============================================================
// services/api/users.js
// Funciones para gestión de usuarios
// ============================================================

import { apiFetch } from "./config";

/** Listar usuarios */
export async function getUsers(options = {}) {
  return await apiFetch(`/users/`, options);
}

/** Crear usuario */
export async function postUser(data) {
  return await apiFetch(`/users/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Editar usuario (perfil) por id */
export async function patchUser(id, data) {
  return await apiFetch(`/users/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
