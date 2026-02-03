// ============================================================
// services/api/customers.js
// Funciones para gestión de clientes
// ============================================================

import { apiFetch } from "./config";

/** Listar clientes */
export async function getCustomers() {
  return await apiFetch(`/customers/`);
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
