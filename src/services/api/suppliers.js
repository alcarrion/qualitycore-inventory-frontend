// ============================================================
// services/api/suppliers.js
// Funciones para gestión de proveedores
// ============================================================

import { apiFetch } from "./config";

/** Listar proveedores */
export async function getSuppliers() {
  return await apiFetch(`/suppliers/`);
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
