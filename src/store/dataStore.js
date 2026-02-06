// ============================================================
// store/dataStore.js
// Estado global centralizado con Zustand
// ============================================================

import { create } from 'zustand';
import {
  getProducts,
  getSuppliers,
  getCategories,
  getCustomers,
  getAlerts,
  getDashboardSummary,
  getMovements,
  getSales,
  getPurchases,
} from '../services/api';

/**
 * Store global de datos de la aplicación
 * Centraliza todos los datos compartidos entre páginas
 */
export const useDataStore = create((set, get) => ({
  // ==================== ESTADO ====================

  // Inventario
  products: [],
  suppliers: [],
  categories: [],

  // Clientes
  customers: [],

  // Dashboard
  alerts: [],
  dashboardData: {
    total_products: 0,
    total_customers: 0,
    total_movements: 0,
    total_entries: 0,
    total_exits: 0,
    low_stock_alerts: 0,
    total_sales: 0,
  },

  // Transacciones
  movements: [],
  sales: [],
  purchases: [],

  // Estado de carga
  loading: false,
  error: null,

  // ==================== ACCIONES ====================

  // --- Productos ---
  fetchProducts: async () => {
    try {
      const res = await getProducts();
      const list = res.data?.results || res.data || [];
      const productsList = Array.isArray(list) ? list : [];
      set({ products: productsList.filter(p => !p.deleted_at) });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ error: 'Error al cargar productos' });
    }
  },

  // --- Proveedores ---
  fetchSuppliers: async () => {
    try {
      const res = await getSuppliers();
      const list = res.data?.results || res.data || [];
      const suppliersList = Array.isArray(list) ? list : [];
      set({ suppliers: suppliersList.filter(s => !s.deleted_at) });
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      set({ error: 'Error al cargar proveedores' });
    }
  },

  // --- Categorías ---
  fetchCategories: async () => {
    try {
      const res = await getCategories();
      const list = res.data?.results || res.data || [];
      const categoriesList = Array.isArray(list) ? list : [];
      set({ categories: categoriesList });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ error: 'Error al cargar categorías' });
    }
  },

  // --- Clientes ---
  fetchCustomers: async () => {
    try {
      const res = await getCustomers();
      const list = res.data?.results || res.data || [];
      const customersList = Array.isArray(list) ? list : [];
      set({ customers: customersList.filter(c => !c.deleted_at) });
    } catch (error) {
      console.error('Error fetching customers:', error);
      set({ error: 'Error al cargar clientes' });
    }
  },

  // --- Alertas ---
  fetchAlerts: async () => {
    try {
      const res = await getAlerts();
      const list = res.data?.results || res.data || [];
      const alertsList = Array.isArray(list) ? list : [];
      set({ alerts: alertsList });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      set({ error: 'Error al cargar alertas' });
    }
  },

  // --- Dashboard Summary ---
  fetchDashboard: async () => {
    try {
      const res = await getDashboardSummary();
      if (res.ok && res.data) {
        set({ dashboardData: res.data });
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      set({ error: 'Error al cargar dashboard' });
    }
  },

  // --- Movimientos ---
  fetchMovements: async () => {
    try {
      const res = await getMovements();
      const list = res.data?.results || res.data || [];
      const movementsList = Array.isArray(list) ? list : [];
      set({ movements: movementsList });
    } catch (error) {
      console.error('Error fetching movements:', error);
      set({ error: 'Error al cargar movimientos' });
    }
  },

  // --- Ventas ---
  fetchSales: async () => {
    try {
      const res = await getSales();
      const list = res.data?.results || res.data || [];
      const salesList = Array.isArray(list) ? list : [];
      set({ sales: salesList });
    } catch (error) {
      console.error('Error fetching sales:', error);
      set({ error: 'Error al cargar ventas' });
    }
  },

  // --- Compras ---
  fetchPurchases: async () => {
    try {
      const res = await getPurchases();
      const list = res.data?.results || res.data || [];
      const purchasesList = Array.isArray(list) ? list : [];
      set({ purchases: purchasesList });
    } catch (error) {
      console.error('Error fetching purchases:', error);
      set({ error: 'Error al cargar compras' });
    }
  },

  // --- Fetch All (carga inicial) ---
  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const store = get();
      await Promise.all([
        store.fetchProducts(),
        store.fetchSuppliers(),
        store.fetchCategories(),
        store.fetchCustomers(),
        store.fetchAlerts(),
        store.fetchDashboard(),
        store.fetchMovements(),
        store.fetchSales(),
        store.fetchPurchases(),
      ]);
    } catch (error) {
      console.error('Error in fetchAll:', error);
      set({ error: 'Error al cargar datos' });
    } finally {
      set({ loading: false });
    }
  },

  // --- Setters directos (para optimistic updates) ---
  setAlerts: (alerts) => set({ alerts }),
  setProducts: (products) => set({ products }),
  setCustomers: (customers) => set({ customers }),

  // --- Utilidades ---
  clearError: () => set({ error: null }),
}));
