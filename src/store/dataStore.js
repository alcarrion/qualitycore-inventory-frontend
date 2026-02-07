// ============================================================
// store/dataStore.js
// Estado global centralizado con Zustand
// ============================================================

import { create } from 'zustand';
import { logger } from '../utils/logger';
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
  getAppConfig,
} from '../services/api';

/**
 * Helper: Carga todas las páginas de un endpoint paginado
 */
async function fetchAllPages(fetchFn) {
  let allItems = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await fetchFn(page);
    const results = res.data?.results || res.data || [];

    if (Array.isArray(results) && results.length > 0) {
      allItems = [...allItems, ...results];
      hasMore = !!res.data?.next;
      page++;
    } else {
      hasMore = false;
    }
  }

  return allItems;
}

/**
 * Store global de datos de la aplicación
 * Centraliza todos los datos compartidos entre páginas
 */
export const useDataStore = create((set, get) => ({
  // ==================== ESTADO ====================

  // Configuración del sistema (desde backend)
  appConfig: {
    tax_rate: { iva: 0.15 },
    pagination: { default_page_size: 20, page_size_options: [10, 20, 50, 100] },
    validation: { phone_length: 10, password_min_length: 8 },
    timeouts: {
      toast_default: 5000,
      toast_short: 3000,
      toast_long: 8000,
      message_display: 4000,
      redirect_delay: 2000,
      polling_interval: 2000,
      clock_interval: 1000,
    },
    image: {
      max_size_mb: 2,
      max_size_bytes: 2097152,
      allowed_types: ['image/jpeg', 'image/png'],
    },
    limits: { max_product_price: 9999999.99, max_quantity: 99999 },
  },
  configLoaded: false,

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

  // --- Configuración del sistema (desde backend) ---
  fetchAppConfig: async () => {
    try {
      const res = await getAppConfig();
      if (res.ok && res.data) {
        set({ appConfig: res.data, configLoaded: true });
      }
    } catch (error) {
      logger.error('Error fetching app config:', error);
      // Si falla, mantener valores por defecto
    }
  },

  // --- Productos (carga TODAS las páginas) ---
  fetchProducts: async () => {
    try {
      const allProducts = await fetchAllPages(getProducts);
      set({ products: allProducts.filter(p => !p.deleted_at) });
    } catch (error) {
      logger.error('Error fetching products:', error);
      set({ error: 'Error al cargar productos' });
    }
  },

  // --- Proveedores (carga TODAS las páginas) ---
  fetchSuppliers: async () => {
    try {
      const allSuppliers = await fetchAllPages(getSuppliers);
      set({ suppliers: allSuppliers.filter(s => !s.deleted_at) });
    } catch (error) {
      logger.error('Error fetching suppliers:', error);
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
      logger.error('Error fetching categories:', error);
      set({ error: 'Error al cargar categorías' });
    }
  },

  // --- Clientes (carga TODAS las páginas) ---
  fetchCustomers: async () => {
    try {
      const allCustomers = await fetchAllPages(getCustomers);
      set({ customers: allCustomers.filter(c => !c.deleted_at) });
    } catch (error) {
      logger.error('Error fetching customers:', error);
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
      logger.error('Error fetching alerts:', error);
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
      logger.error('Error fetching dashboard:', error);
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
      logger.error('Error fetching movements:', error);
      set({ error: 'Error al cargar movimientos' });
    }
  },

  // --- Ventas (carga TODAS las páginas) ---
  fetchSales: async () => {
    try {
      const allSales = await fetchAllPages(getSales);
      set({ sales: allSales });
    } catch (error) {
      logger.error('Error fetching sales:', error);
      set({ error: 'Error al cargar ventas' });
    }
  },

  // --- Compras (carga TODAS las páginas) ---
  fetchPurchases: async () => {
    try {
      const allPurchases = await fetchAllPages(getPurchases);
      set({ purchases: allPurchases });
    } catch (error) {
      logger.error('Error fetching purchases:', error);
      set({ error: 'Error al cargar compras' });
    }
  },

  // --- Fetch All (carga inicial) ---
  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const store = get();

      // Cargar configuración primero (no bloquea si falla)
      await store.fetchAppConfig();

      // Cargar datos en paralelo
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
      logger.error('Error in fetchAll:', error);
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
