// hooks/useCustomersData.js
import { useState, useEffect, useCallback } from "react";
import { getCustomers } from "../services/api";

export function useCustomersData() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    const res = await getCustomers();
    const list = res.data?.results || res.data || [];
    const customersList = Array.isArray(list) ? list : [];
    setCustomers(customersList.filter(c => !c.deleted_at));
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchCustomers();
    } catch (err) {
      setError(err.message || "Error al cargar datos de clientes");
      console.error("Error loading customers data:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    fetchAll,
  };
}
