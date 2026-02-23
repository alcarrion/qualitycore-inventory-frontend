// ============================================================
// services/api/purchases.js
// Funciones para gestión de compras
// ============================================================

import { apiFetch } from "./config";

/** Listar compras con paginación y filtros server-side */
export async function getPurchases(params = {}, options = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page);
  if (params.search) query.set('search', params.search);
  if (params.start_date) query.set('start_date', params.start_date);
  if (params.end_date) query.set('end_date', params.end_date);
  if (params.no_page) query.set('no_page', params.no_page);
  const qs = query.toString();
  return await apiFetch(`/purchases/${qs ? `?${qs}` : ''}`, options);
}

/** Crear compra con múltiples productos */
export async function postPurchase(data) {
  return await apiFetch(`/purchases/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Obtener detalles de una compra */
export async function getPurchase(id) {
  return await apiFetch(`/purchases/${id}/`);
}
