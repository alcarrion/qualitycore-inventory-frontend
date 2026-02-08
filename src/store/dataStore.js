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
 * Helper: Crea un fetcher paginado (carga todas las páginas)
 */
function createPaginatedFetcher(set, key, apiFn, label, filter) {
  return async () => {
    try {
      const all = await fetchAllPages(apiFn);
      set({ [key]: filter ? all.filter(filter) : all });
    } catch (error) {
      logger.error(`Error fetching ${key}:`, error);
      set({ error: `Error al cargar ${label}` });
    }
  };
}

/**
 * Helper: Crea un fetcher de página única (extrae results o data)
 */
function createSimpleFetcher(set, key, apiFn, label) {
  return async () => {
    try {
      const res = await apiFn();
      const list = res.data?.results || res.data || [];
      set({ [key]: Array.isArray(list) ? list : [] });
    } catch (error) {
      logger.error(`Error fetching ${key}:`, error);
      set({ error: `Error al cargar ${label}` });
    }
  };
}

const notDeleted = item => !item.deleted_at;

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
    }
  },

  // --- Fetchers paginados ---
  fetchProducts:  createPaginatedFetcher(set, 'products',  getProducts,  'productos',    notDeleted),
  fetchSuppliers: createPaginatedFetcher(set, 'suppliers', getSuppliers, 'proveedores',  notDeleted),
  fetchCustomers: createPaginatedFetcher(set, 'customers', getCustomers, 'clientes',     notDeleted),
  fetchSales:     createPaginatedFetcher(set, 'sales',     getSales,     'ventas'),
  fetchPurchases: createPaginatedFetcher(set, 'purchases', getPurchases, 'compras'),

  // --- Fetchers de página única ---
  fetchCategories: createSimpleFetcher(set, 'categories', getCategories, 'categorías'),
  fetchAlerts:     createSimpleFetcher(set, 'alerts',     getAlerts,     'alertas'),
  fetchMovements:  createSimpleFetcher(set, 'movements',  getMovements,  'movimientos'),

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
