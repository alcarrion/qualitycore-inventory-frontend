// ============================================================
// services/api/customers.js
// Funciones para gestión de clientes
// ============================================================

import { apiFetch } from "./config";

/** Listar clientes (con paginación opcional) */
export async function getCustomers(page = null) {
  const url = page ? `/customers/?page=${page}` : `/customers/`;
  return await apiFetch(url);
}

/** Crear cliente */
export async function postCustomer(data) {
  return await apiFetch(`/customers/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Editar cliente (PATCH) */
export async function patchCustomer(id, data) {
  return await apiFetch(`/customers/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
