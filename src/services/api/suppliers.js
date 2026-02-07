// ============================================================
// services/api/suppliers.js
// Funciones para gestión de proveedores
// ============================================================

import { apiFetch } from "./config";

/** Listar proveedores (con paginación opcional) */
export async function getSuppliers(page = null) {
  const url = page ? `/suppliers/?page=${page}` : `/suppliers/`;
  return await apiFetch(url);
}

/** Crear proveedor */
export async function postSupplier(data) {
  return await apiFetch(`/suppliers/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Editar proveedor (PATCH) */
export async function patchSupplier(id, data) {
  return await apiFetch(`/suppliers/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
