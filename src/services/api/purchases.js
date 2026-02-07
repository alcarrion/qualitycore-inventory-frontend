// ============================================================
// services/api/purchases.js
// Funciones para gestión de compras
// ============================================================

import { apiFetch } from "./config";

/** Listar compras (con paginación opcional) */
export async function getPurchases(page = null) {
  const url = page ? `/purchases/?page=${page}` : `/purchases/`;
  return await apiFetch(url);
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
