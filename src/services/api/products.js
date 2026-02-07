// ============================================================
// services/api/products.js
// Funciones para gestión de productos
// ============================================================

import { apiFetch, apiFetchForm } from "./config";

/** Listar productos (con paginación opcional) */
export async function getProducts(page = null) {
  const url = page ? `/products/?page=${page}` : `/products/`;
  return await apiFetch(url);
}

/** Crear producto (multipart) */
export async function postProduct(formData) {
  return await apiFetchForm(`/products/`, formData);
}

/** PATCH producto (multipart) */
export async function patchProduct(id, formData) {
  return await apiFetchForm(`/products/${id}/`, formData, { method: "PATCH" });
}

/** PATCH JSON producto (soft delete u otros campos simples) */
export async function patchProductJson(id, data) {
  return await apiFetch(`/products/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
