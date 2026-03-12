// hooks/useProductSearch.ts
// Búsqueda lazy de productos por nombre y/o proveedor contra el servidor.
// Reemplaza la lectura de products del store global para los dropdowns de
// ajuste, transacción y cotización — evita cargar todos los productos al arrancar.
import { useState, useEffect } from "react";
import { getProducts } from "../services/api";
import type { Product } from "../types/models";
import type { PaginatedResponse } from "../types/api";

// Caché a nivel de módulo para evitar peticiones duplicadas cuando varios
// QuotedProductRow montan en la misma pantalla con el mismo término de búsqueda.
// TTL = 30 s; la clave es "search|supplier".
// MAX_CACHE_SIZE limita el crecimiento en sesiones largas con muchos términos
// distintos: cuando se alcanza el límite, se elimina la entrada más antigua
// (orden de inserción del Map) antes de añadir la nueva.
const CACHE_TTL_MS = 30_000;
const MAX_CACHE_SIZE = 100;
interface CacheEntry { data: Product[]; timestamp: number }
const searchCache = new Map<string, CacheEntry>();

function getCached(key: string): Product[] | null {
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    searchCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: Product[]): void {
  if (searchCache.size >= MAX_CACHE_SIZE) {
    // Evict the oldest entry (Maps iterate in insertion order)
    searchCache.delete(searchCache.keys().next().value as string);
  }
  searchCache.set(key, { data, timestamp: Date.now() });
}

/** Vacía toda la caché de búsqueda de productos.
 *  Llamar después de crear o editar un producto para que los dropdowns
 *  muestren los datos actualizados en la siguiente búsqueda. */
export function clearProductCache(): void {
  searchCache.clear();
}

/**
 * Fetch lazy de productos filtrados por el servidor.
 * Debouncea el término de búsqueda 300 ms antes de llamar al API.
 * Resultados se cachean 30 s para evitar peticiones duplicadas entre
 * múltiples componentes que buscan el mismo término simultáneamente.
 *
 * @param search   - Texto a buscar (nombre del producto)
 * @param supplier - ID de proveedor opcional (filtra por proveedor en modo compra)
 */
export function useProductSearch(
  search: string,
  supplier?: string | number
): { products: Product[]; loading: boolean } {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce del texto de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch al servidor cuando cambia el texto debounced o el proveedor
  useEffect(() => {
    const cacheKey = `${debouncedSearch}|${supplier ?? ""}`;
    const cached = getCached(cacheKey);
    if (cached) {
      setProducts(cached);
      return;
    }

    const ac = new AbortController();
    setLoading(true);

    getProducts(1, {
      signal: ac.signal,
      search: debouncedSearch || undefined,
      supplier: supplier ? String(supplier) : undefined,
      is_active: "true",
    })
      .then((res) => {
        if (res.aborted) return;
        const data = res.data as PaginatedResponse<Product>;
        const results = data?.results ?? [];
        setCache(cacheKey, results);
        setProducts(results);
        setLoading(false);
      })
      .catch((err) => {
        if ((err as Error).name === "AbortError") return;
        setLoading(false);
      });

    return () => ac.abort();
  }, [debouncedSearch, supplier]);

  return { products, loading };
}
