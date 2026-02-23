// ============================================================
// services/api/movements.js
// Funciones para gestión de movimientos de inventario
// ============================================================

import { apiFetch } from "./config";

/** Listar movimientos con paginación y filtros server-side */
export async function getMovements(params = {}, options = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page);
  if (params.type) query.set('type', params.type);
  const qs = query.toString();
  return await apiFetch(`/movements/${qs ? `?${qs}` : ''}`, options);
}

/** Crear movimiento */
export async function postMovement(data) {
  return await apiFetch(`/movements/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Crear ajuste de inventario (solo Admin/SuperAdmin) */
export async function postAdjustment(data) {
  return await apiFetch(`/movements/adjustments/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Corregir un movimiento existente (solo Admin/SuperAdmin) */
export async function postCorrection(movementId, data) {
  return await apiFetch(`/movements/${movementId}/correct/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
