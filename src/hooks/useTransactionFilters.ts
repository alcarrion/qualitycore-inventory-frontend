// hooks/useTransactionFilters.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useTransactionsStore } from "../store/transactionsStore";
import { PAGINATION } from "../constants/config";
import type { FilterParams } from "../types/api";

/**
 * Hook para manejar filtros, paginación y carga server-side de transacciones.
 */
export function useTransactionFilters() {
  const fetchSales = useTransactionsStore(state => state.fetchSales);
  const fetchPurchases = useTransactionsStore(state => state.fetchPurchases);
  const fetchMovements = useTransactionsStore(state => state.fetchMovements);
  const salesCount = useTransactionsStore(state => state.salesCount);
  const purchasesCount = useTransactionsStore(state => state.purchasesCount);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPageSales, setCurrentPageSales] = useState(1);
  const [currentPagePurchases, setCurrentPagePurchases] = useState(1);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Cargar datos del servidor con los filtros actuales
  const loadTransactions = useCallback(() => {
    const filters: FilterParams = {};
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;
    if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();

    fetchSales({ ...filters, page: currentPageSales });
    fetchPurchases({ ...filters, page: currentPagePurchases });
    fetchMovements({
      type: 'adjustment,correction',
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      ...(startDate ? { start_date: startDate } : {}),
      ...(endDate ? { end_date: endDate } : {}),
    });
  }, [startDate, endDate, debouncedSearch, currentPageSales, currentPagePurchases, fetchSales, fetchPurchases, fetchMovements]);

  // Carga inicial + recarga cuando cambian filtros/página
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Debounce para búsqueda por texto
  const handleSearchChange = useCallback((value: string): void => {
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

  const clearDates = useCallback((): void => {
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
