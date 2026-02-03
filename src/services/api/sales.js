// ============================================================
// services/api/sales.js
// Funciones para gestión de ventas
// ============================================================

import { apiFetch } from "./config";

/** Listar ventas */
export async function getSales() {
  return await apiFetch(`/sales/`);
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
