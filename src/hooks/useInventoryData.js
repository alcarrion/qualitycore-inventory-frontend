// hooks/useInventoryData.js
import { useState, useEffect, useCallback } from "react";
import { getProducts, getSuppliers, getCategories } from "../services/api";

export function useInventoryData() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    const res = await getProducts();
    const list = res.data?.results || res.data || [];
    const productsList = Array.isArray(list) ? list : [];
    setProducts(productsList.filter(p => !p.deleted_at));
  }, []);

  const fetchSuppliers = useCallback(async () => {
    const res = await getSuppliers();
    const list = res.data?.results || res.data || [];
    const suppliersList = Array.isArray(list) ? list : [];
    setSuppliers(suppliersList.filter(p => !p.deleted_at));
  }, []);

  const fetchCategories = useCallback(async () => {
    const res = await getCategories();
    const list = res.data?.results || res.data || [];
    const categoriesList = Array.isArray(list) ? list : [];
    setCategories(categoriesList);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchProducts(), fetchSuppliers(), fetchCategories()]);
    } catch (err) {
      setError(err.message || "Error al cargar datos del inventario");
      console.error("Error loading inventory data:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, fetchSuppliers, fetchCategories]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    products,
    suppliers,
    categories,
    loading,
    error,
    fetchProducts,
    fetchSuppliers,
    fetchCategories,
    fetchAll,
  };
}
