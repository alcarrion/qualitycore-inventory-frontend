// ============================================================
// services/api/sales.js
// Funciones para gestión de ventas
// ============================================================

import { apiFetch } from "./config";

/** Listar ventas con paginación y filtros server-side */
export async function getSales(params = {}, options = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page);
  if (params.search) query.set('search', params.search);
  if (params.start_date) query.set('start_date', params.start_date);
  if (params.end_date) query.set('end_date', params.end_date);
  if (params.no_page) query.set('no_page', params.no_page);
  const qs = query.toString();
  return await apiFetch(`/sales/${qs ? `?${qs}` : ''}`, options);
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
