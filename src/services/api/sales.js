// ============================================================
// services/api/sales.js
// Funciones para gestión de ventas
// ============================================================

import { apiFetch } from "./config";

/** Listar ventas (con paginación opcional) */
export async function getSales(page = null) {
  const url = page ? `/sales/?page=${page}` : `/sales/`;
  return await apiFetch(url);
}

/** Crear venta con múltiples productos */
export async function postSale(data) {
  return await apiFetch(`/sales/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Obtener detalles de una venta */
export async function getSale(id) {
  return await apiFetch(`/sales/${id}/`);
}
