// hooks/useTransactionsData.js
import { useState, useEffect, useCallback } from "react";
import {
  getMovements,
  getSales,
  getPurchases,
  getProducts,
  getCustomers,
  getSuppliers,
} from "../services/api";

/**
 * Hook personalizado para manejar todos los datos de transacciones
 * Centraliza los fetches y el estado relacionado con datos del servidor
 */
export function useTransactionsData() {
  const [movements, setMovements] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);  // ✅ FASE 1.2: Estado de error

  const fetchMovements = useCallback(async () => {
    const res = await getMovements();
    const list = res.data?.results || res.data || [];
    const movementsList = Array.isArray(list) ? list : [];
    setMovements(movementsList);
  }, []);

  const fetchSales = useCallback(async () => {
    const res = await getSales();
    const list = res.data?.results || res.data || [];
    const salesList = Array.isArray(list) ? list : [];
    setSales(salesList);
  }, []);

  const fetchPurchases = useCallback(async () => {
    const res = await getPurchases();
    const list = res.data?.results || res.data || [];
    const purchasesList = Array.isArray(list) ? list : [];
    setPurchases(purchasesList);
  }, []);

  const fetchProducts = useCallback(async () => {
    const res = await getProducts();
    const list = res.data?.results || res.data || [];
    const productsList = Array.isArray(list) ? list : [];
    // Filtrar solo productos activos y no eliminados
    setProducts(productsList.filter((p) => p.status === "Activo" && !p.deleted_at));
  }, []);

  const fetchCustomers = useCallback(async () => {
    const res = await getCustomers();
    const list = res.data?.results || res.data || [];
    const customersList = Array.isArray(list) ? list : [];
    setCustomers(customersList.filter((c) => !c.deleted_at));
  }, []);

  const fetchSuppliers = useCallback(async () => {
    const res = await getSuppliers();
    const list = res.data?.results || res.data || [];
    const suppliersList = Array.isArray(list) ? list : [];
    setSuppliers(suppliersList.filter((s) => !s.deleted_at));
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);  // ✅ FASE 1.2: Resetear error antes de fetch
    try {
      await Promise.all([
        fetchMovements(),
        fetchSales(),
        fetchPurchases(),
        fetchProducts(),
        fetchCustomers(),
        fetchSuppliers(),
      ]);
    } catch (err) {
      // ✅ FASE 1.2: Capturar y guardar error
      const errorMessage = err.message || "Error al cargar datos de transacciones";
      setError(errorMessage);
      console.error("Error loading transaction data:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchMovements, fetchSales, fetchPurchases, fetchProducts, fetchCustomers, fetchSuppliers]);

  // Cargar datos inicialmente
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    // Datos
    movements,
    sales,
    purchases,
    products,
    customers,
    suppliers,
    loading,
    error,  // ✅ FASE 1.2: Exponer estado de error
    // Métodos para refrescar
    fetchMovements,
    fetchSales,
    fetchPurchases,
    fetchProducts,
    fetchCustomers,
    fetchSuppliers,
    fetchAll,
  };
}
