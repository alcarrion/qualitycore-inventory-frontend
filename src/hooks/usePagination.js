// hooks/usePagination.js
import { useState, useCallback, useEffect } from "react";
import { logger } from "../utils/logger";

/**
 * Hook para manejar paginación del servidor
 *
 * @param {function} fetchFn - Función que hace el fetch (debe aceptar parámetro page)
 * @param {object} options - Opciones de configuración
 * @param {number} options.pageSize - Items por página (default: 20)
 * @param {boolean} options.autoFetch - Fetch automático al montar (default: true)
 * @param {function} options.filterFn - Función para filtrar resultados (opcional)
 */
export function usePagination(fetchFn, options = {}) {
  const {
    pageSize = 20,
    autoFetch = true,
    filterFn = null
  } = options;

  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch de una página específica
   */
  const fetchPage = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchFn(page);

      if (!res.ok) {
        throw new Error(res.data?.detail || "Error al cargar datos");
      }

      // El backend devuelve: { count, next, previous, results }
      const count = res.data?.count || 0;
      let results = res.data?.results || res.data || [];

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
      setError(err.message || "Error al cargar datos");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, filterFn, pageSize]);

  /**
   * Cambiar a una página específica
   */
  const goToPage = useCallback((page) => {
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
  }, []);  // Solo al montar

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
