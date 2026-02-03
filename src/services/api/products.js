// ============================================================
// services/api/products.js
// Funciones para gestión de productos
// ============================================================

import { apiFetch, apiFetchForm } from "./config";

/** Listar productos */
export async function getProducts() {
  return await apiFetch(`/products/`);
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
