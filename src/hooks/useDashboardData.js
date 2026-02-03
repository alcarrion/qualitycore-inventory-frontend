// hooks/useDashboardData.js
import { useState, useEffect, useCallback } from "react";
import { getAlerts, getDashboardSummary } from "../services/api";

export function useDashboardData() {
  const [alerts, setAlerts] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    total_products: 0,
    total_customers: 0,
    total_movements: 0,
    total_entries: 0,
    total_exits: 0,
    low_stock_alerts: 0,
    total_sales: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = useCallback(async () => {
    const res = await getAlerts();
    const list = res.data?.results || res.data || [];
    const alertsList = Array.isArray(list) ? list : [];
    setAlerts(alertsList);
  }, []);

  const fetchDashboard = useCallback(async () => {
    const res = await getDashboardSummary();
    if (res.ok && res.data) setDashboardData(res.data);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchAlerts(), fetchDashboard()]);
    } catch (err) {
      setError(err.message || "Error al cargar datos del dashboard");
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchAlerts, fetchDashboard]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    alerts,
    setAlerts,
    dashboardData,
    loading,
    error,
    fetchAlerts,
    fetchDashboard,
    fetchAll,
  };
}
