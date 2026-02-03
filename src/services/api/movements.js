// ============================================================
// services/api/movements.js
// Funciones para gestión de movimientos de inventario
// ============================================================

import { apiFetch } from "./config";

/** Listar movimientos */
export async function getMovements() {
  return await apiFetch(`/movements/`);
}

/** Crear movimiento */
export async function postMovement(data) {
  return await apiFetch(`/movements/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
