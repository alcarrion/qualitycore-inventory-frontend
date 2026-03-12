// services/api/utils.ts
// Utilidades compartidas para el acceso paginado a la API.

import type { ApiResponse } from '../../types/api';

/** Número máximo de páginas que fetchAllPages iterará. Previene bucles infinitos
 *  si el servidor tiene un bug que siempre devuelve next != null. */
const MAX_PAGES = 200;

/**
 * Pagina automáticamente una API que sigue el formato { results, next }.
 * Itera hasta agotar todos los resultados, hasta que el signal se cancele,
 * o hasta alcanzar MAX_PAGES (salvaguarda contra bucles infinitos).
 *
 * @param fetchFn  Función que recibe el número de página y devuelve una ApiResponse.
 *                 Puede retornar datos paginados ({ results, next }) o un array plano.
 * @returns        Array con todos los items concatenados, o null si fue abortado.
 */
export async function fetchAllPages<T>(
  fetchFn: (page: number) => Promise<ApiResponse<{ results?: T[]; next?: string | null } | T[]>>
): Promise<T[] | null> {
  const allItems: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= MAX_PAGES) {
    const res = await fetchFn(page);
    if (res.aborted) return null;
    const data = res.data;
    const results: T[] = Array.isArray(data)
      ? (data as T[])
      : ((data as { results?: T[] })?.results ?? []);

    if (results.length > 0) {
      allItems.push(...results);
      hasMore = !!(data as { next?: string | null })?.next;
      page++;
    } else {
      hasMore = false;
    }
  }

  if (page > MAX_PAGES) {
    console.warn(`fetchAllPages: límite de ${MAX_PAGES} páginas alcanzado. Puede haber datos incompletos.`);
  }

  return allItems;
}
