// hooks/useTransactionFilters.js
import { useState, useEffect, useCallback, useRef } from "react";
import { useDataStore } from "../store/dataStore";
import { PAGINATION } from "../constants/config";

/**
 * Hook para manejar filtros, paginación y carga server-side de transacciones.
 */
export function useTransactionFilters() {
  const fetchSales = useDataStore(state => state.fetchSales);
  const fetchPurchases = useDataStore(state => state.fetchPurchases);
  const fetchMovements = useDataStore(state => state.fetchMovements);
  const salesCount = useDataStore(state => state.salesCount);
  const purchasesCount = useDataStore(state => state.purchasesCount);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPageSales, setCurrentPageSales] = useState(1);
  const [currentPagePurchases, setCurrentPagePurchases] = useState(1);

  const searchTimerRef = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Cargar datos del servidor con los filtros actuales
  const loadTransactions = useCallback(() => {
    const filters = {};
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;

    // Cuando hay búsqueda, traer todos los registros (sin paginar)
    // para que el filtro client-side pueda buscar en todo
    if (debouncedSearch.trim()) {
      filters.no_page = 'true';
      fetchSales(filters);
      fetchPurchases(filters);
    } else {
      fetchSales({ ...filters, page: currentPageSales });
      fetchPurchases({ ...filters, page: currentPagePurchases });
    }

    fetchMovements({ type: 'adjustment,correction' });
  }, [startDate, endDate, debouncedSearch, currentPageSales, currentPagePurchases, fetchSales, fetchPurchases, fetchMovements]);

  // Carga inicial + recarga cuando cambian filtros/página
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Debounce para búsqueda por texto
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPagePurchases(1);
      setCurrentPageSales(1);
    }, 400);
  }, []);

  // Resetear a página 1 cuando cambian los filtros de fecha
  useEffect(() => {
    setCurrentPagePurchases(1);
    setCurrentPageSales(1);
  }, [startDate, endDate]);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const clearDates = useCallback(() => {
    setStartDate("");
    setEndDate("");
  }, []);

  const totalPagesSales = Math.ceil(salesCount / PAGINATION.DEFAULT_PAGE_SIZE);
  const totalPagesPurchases = Math.ceil(purchasesCount / PAGINATION.DEFAULT_PAGE_SIZE);

  return {
    // Filtros
    searchTerm,
    handleSearchChange,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    clearDates,

    // Paginación
    currentPageSales,
    setCurrentPageSales,
    currentPagePurchases,
    setCurrentPagePurchases,
    totalPagesSales,
    totalPagesPurchases,
    salesCount,
    purchasesCount,

    // Recarga
    loadTransactions,
  };
}
