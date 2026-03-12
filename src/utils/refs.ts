// utils/refs.ts
// Helpers para trabajar con Ref<T> = number | T sin duplicar type guards.
//
// Uso:
//   const catId = resolveId(product.category);   // number
//   const cat   = resolveObj(product.category, categories);  // Category | undefined
import type { Ref, NullableRef } from "../types/models";

/**
 * Extrae el ID de un Ref<T>: si ya es number lo devuelve; si es el objeto, toma obj.id.
 * Útil para comparar o filtrar sin importar si la API devolvió el objeto completo o solo el ID.
 */
export function resolveId<T extends { id: number }>(ref: Ref<T>): number {
  return typeof ref === "number" ? ref : ref.id;
}

/**
 * Versión nullable de resolveId — devuelve undefined si ref es null o undefined.
 * Acepta también `undefined` para cubrir campos opcionales del modelo (category?, etc.).
 */
export function resolveNullableId<T extends { id: number }>(
  ref: NullableRef<T> | undefined
): number | undefined {
  if (ref == null) return undefined;
  return resolveId(ref);
}

/**
 * Resuelve un Ref<T> al objeto completo buscando en el array `items`.
 * Si `ref` ya es el objeto, lo devuelve directamente sin buscar.
 * Devuelve undefined si no encuentra el ID en `items`.
 */
export function resolveObj<T extends { id: number }>(ref: Ref<T>, items: T[]): T | undefined {
  if (typeof ref !== "number") return ref;
  return items.find((i) => i.id === ref);
}
