// hooks/useEntitySearch.ts
// Hook genérico para búsqueda lazy server-side de cualquier entidad.
// Encapsula debounce (300ms), AbortController y manejo de loading.
import { useState, useEffect } from "react";
import type { PaginatedResponse } from "../types/api";
import type { ApiResponse } from "../types/api";

type FetchFn<T> = (
  page: number,
  search: string,
  options?: { signal?: AbortSignal }
) => Promise<ApiResponse>;

/**
 * Fetch lazy de entidades filtradas por el servidor.
 * Debouncea el término de búsqueda 300 ms antes de llamar al API.
 *
 * @param search  - Texto a buscar
 * @param fetchFn - Función de fetch (getCustomers, getSuppliers, etc.)
 */
export function useEntitySearch<T>(
  search: string,
  fetchFn: FetchFn<T>
): { items: T[]; loading: boolean } {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce del texto de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch al servidor cuando cambia el texto debounced
  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);

    fetchFn(1, debouncedSearch || "", { signal: ac.signal })
      .then((res) => {
        if (res.aborted) return;
        const data = res.data as PaginatedResponse<T>;
        setItems(data?.results ?? []);
        setLoading(false);
      })
      .catch((err) => {
        if ((err as Error).name === "AbortError") return;
        setLoading(false);
      });

    return () => ac.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return { items, loading };
}
