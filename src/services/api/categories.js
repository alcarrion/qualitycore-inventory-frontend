// ============================================================
// services/api/categories.js
// Funciones para gestión de categorías
// ============================================================

import { apiFetch } from "./config";

/** Listar categorías */
export async function getCategories() {
  return await apiFetch(`/categories/`);
}

/** Crear categoría */
export async function postCategory(name) {
  return await apiFetch(`/categories/`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}
