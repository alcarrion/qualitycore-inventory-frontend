// hooks/usePagination.ts
import { useState, useCallback, useEffect } from "react";
import { logger } from "../utils/logger";
import type { ApiResponse } from "../types/api";

export type PaginationData<T> = { count?: number; results?: T[]; detail?: string } | T[];

interface PaginationOptions<T> {
  pageSize?: number;
  autoFetch?: boolean;
  filterFn?: ((item: T) => boolean) | null;
}

/**
 * Hook para manejar paginación del servidor
 *
 * @param fetchFn - Función que hace el fetch (debe aceptar parámetro page)
 * @param options - Opciones de configuración
 */
export function usePagination<T>(
  fetchFn: (page: number) => Promise<ApiResponse<PaginationData<T>>>,
  options: PaginationOptions<T> = {}
) {
  const {
    pageSize = 20,
    autoFetch = true,
    filterFn = null,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch de una página específica
   */
  const fetchPage = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchFn(page);

      if (!res.ok) {
        throw new Error(
          (res.data as { detail?: string } | null)?.detail ?? "Error al cargar datos"
        );
      }

      // El backend devuelve: { count, next, previous, results }
      const rawData = res.data;
      const count = (rawData as { count?: number })?.count ?? 0;
      let results: T[] = Array.isArray(rawData)
        ? (rawData as T[])
        : ((rawData as { results?: T[] })?.results ?? []);

      // Asegurar que es array
      if (!Array.isArray(results)) {
        results = [];
      }

      // Aplicar filtro si existe (ej: excluir deleted_at)
      if (filterFn) {
        results = results.filter(filterFn);
      }

      setData(results);
      setTotalItems(count);
      setTotalPages(Math.ceil(count / pageSize));
      setCurrentPage(page);
    } catch (err) {
      logger.error("Pagination fetch error:", err);
      setError((err as Error).message ?? "Error al cargar datos");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, filterFn, pageSize]);

  /**
   * Cambiar a una página específica
   */
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchPage(page);
    }
  }, [fetchPage, totalPages]);

  /**
   * Ir a la primera página
   */
  const goToFirst = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  /**
   * Ir a la última página
   */
  const goToLast = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  /**
   * Refrescar la página actual
   */
  const refresh = useCallback(() => {
    fetchPage(currentPage);
  }, [fetchPage, currentPage]);

  // Auto-fetch al montar
  useEffect(() => {
    if (autoFetch) {
      fetchPage(1);
    }
  }, [autoFetch, fetchPage]);

  return {
    // Datos
    data,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    loading,
    error,

    // Acciones
    goToPage,
    goToFirst,
    goToLast,
    refresh,
    fetchPage,

    // Helpers
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    isEmpty: data.length === 0 && !loading,
  };
}
