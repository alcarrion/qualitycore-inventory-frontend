// ============================================================
// store/dataStore.js
// Estado global centralizado con Zustand
//
// CONVENCIÓN DE ESTADO:
//   - Zustand: datos de negocio (productos, clientes, ventas, etc.)
//   - AppContext: estado de UI (toasts, loading, dark mode)
//   - authService + App.js useState: datos de usuario autenticado
//   - Ver authService.js para más detalle
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
    if (res.aborted) return null;
    const results = res.data?.results || res.data || [];

    if (Array.isArray(results) && results.length > 0) {
      allItems.push(...results);
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
  return async (signal) => {
    try {
      const wrappedFn = (page) => apiFn(page, signal ? { signal } : {});
      const all = await fetchAllPages(wrappedFn);
      if (all === null) return; // aborted
      set((state) => ({ [key]: filter ? all.filter(filter) : all, errors: { ...state.errors, [key]: null } }));
    } catch (error) {
      if (error.name === 'AbortError') return;
      logger.error(`Error fetching ${key}:`, error);
      set((state) => ({ errors: { ...state.errors, [key]: `Error al cargar ${label}` } }));
    }
  };
}

/**
 * Helper: Crea un fetcher de página única (extrae results o data)
 */
function createSimpleFetcher(set, key, apiFn, label) {
  return async (signal) => {
    try {
      const res = await apiFn(undefined, signal ? { signal } : {});
      if (res.aborted) return;
      const list = res.data?.results || res.data || [];
      set((state) => ({ [key]: Array.isArray(list) ? list : [], errors: { ...state.errors, [key]: null } }));
    } catch (error) {
      if (error.name === 'AbortError') return;
      logger.error(`Error fetching ${key}:`, error);
      set((state) => ({ errors: { ...state.errors, [key]: `Error al cargar ${label}` } }));
    }
  };
}

const notDeleted = item => !item.deleted_at;

// Contador para deduplicar fetchAll: si se llama dos veces rápido,
// la primera llamada detecta que ya hay una más reciente y no sobrescribe.
let fetchAllCounter = 0;

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

  // Transacciones (paginación server-side)
  sales: [],
  salesCount: 0,
  purchases: [],
  purchasesCount: 0,
  movements: [],
  movementsCount: 0,

  // Estado de carga
  loading: false,
  errors: {},

  // ==================== ACCIONES ====================

  // --- Configuración del sistema (desde backend) ---
  fetchAppConfig: async (signal) => {
    try {
      const res = await getAppConfig(signal ? { signal } : {});
      if (res.aborted) return;
      if (res.ok && res.data) {
        set({ appConfig: res.data, configLoaded: true });
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      logger.error('Error fetching app config:', error);
    }
  },

  // --- Fetchers paginados (carga completa para catálogos pequeños) ---
  fetchProducts:  createPaginatedFetcher(set, 'products',  getProducts,  'productos',    notDeleted),
  fetchSuppliers: createPaginatedFetcher(set, 'suppliers', getSuppliers, 'proveedores',  notDeleted),
  fetchCustomers: createPaginatedFetcher(set, 'customers', getCustomers, 'clientes',     notDeleted),

  // --- Fetchers de página única ---
  fetchCategories: createSimpleFetcher(set, 'categories', getCategories, 'categorías'),
  fetchAlerts:     createSimpleFetcher(set, 'alerts',     getAlerts,     'alertas'),

  // --- Fetchers con paginación server-side (una página a la vez) ---
  fetchSales: async (params = {}, signal) => {
    try {
      const res = await getSales(params, signal ? { signal } : {});
      if (res.aborted) return;
      const results = res.data?.results || [];
      const count = res.data?.count || 0;
      set((state) => ({ sales: results, salesCount: count, errors: { ...state.errors, sales: null } }));
    } catch (error) {
      if (error.name === 'AbortError') return;
      logger.error('Error fetching sales:', error);
      set((state) => ({ errors: { ...state.errors, sales: 'Error al cargar ventas' } }));
    }
  },

  fetchPurchases: async (params = {}, signal) => {
    try {
      const res = await getPurchases(params, signal ? { signal } : {});
      if (res.aborted) return;
      const results = res.data?.results || [];
      const count = res.data?.count || 0;
      set((state) => ({ purchases: results, purchasesCount: count, errors: { ...state.errors, purchases: null } }));
    } catch (error) {
      if (error.name === 'AbortError') return;
      logger.error('Error fetching purchases:', error);
      set((state) => ({ errors: { ...state.errors, purchases: 'Error al cargar compras' } }));
    }
  },

  fetchMovements: async (params = {}, signal) => {
    try {
      const res = await getMovements(params, signal ? { signal } : {});
      if (res.aborted) return;
      const results = res.data?.results || [];
      const count = res.data?.count || 0;
      set((state) => ({ movements: results, movementsCount: count, errors: { ...state.errors, movements: null } }));
    } catch (error) {
      if (error.name === 'AbortError') return;
      logger.error('Error fetching movements:', error);
      set((state) => ({ errors: { ...state.errors, movements: 'Error al cargar movimientos' } }));
    }
  },

  // --- Dashboard Summary ---
  fetchDashboard: async (signal) => {
    try {
      const res = await getDashboardSummary(undefined, signal ? { signal } : {});
      if (res.aborted) return;
      if (res.ok && res.data) {
        set({ dashboardData: res.data });
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      logger.error('Error fetching dashboard:', error);
      set((state) => ({ errors: { ...state.errors, dashboard: 'Error al cargar dashboard' } }));
    }
  },

  // --- Fetch All (carga inicial) ---
  fetchAll: async (signal) => {
    // Deduplicación: si se llama dos veces rápido, solo la última actualiza el store
    const thisCall = ++fetchAllCounter;

    set({ loading: true, errors: {} });
    try {
      const store = get();

      // Cargar configuración primero (no bloquea si falla)
      await store.fetchAppConfig(signal);

      // Si ya se disparó otra llamada más reciente, cancelar esta
      if (thisCall !== fetchAllCounter) return;

      // Cargar datos en paralelo (catálogos + dashboard)
      // Ventas, compras y movimientos se cargan on-demand en TransactionsPage
      // con paginación server-side para no traer todo a memoria.
      await Promise.all([
        store.fetchProducts(signal),
        store.fetchSuppliers(signal),
        store.fetchCategories(signal),
        store.fetchCustomers(signal),
        store.fetchAlerts(signal),
        store.fetchDashboard(signal),
      ]);
    } catch (error) {
      if (error.name === 'AbortError') return;
      if (thisCall !== fetchAllCounter) return;
      logger.error('Error in fetchAll:', error);
      set((state) => ({ errors: { ...state.errors, _global: 'Error al cargar datos' } }));
    } finally {
      if (thisCall === fetchAllCounter) {
        set({ loading: false });
      }
    }
  },

  // --- Setters directos (para optimistic updates) ---
  setAlerts: (alerts) => set({ alerts }),
  setProducts: (products) => set({ products }),
  setCustomers: (customers) => set({ customers }),

  // --- Utilidades ---
  clearErrors: () => set({ errors: {} }),
}));

/**
 * Selector: retorna el primer error activo del mapa de errores.
 * Uso: const dataError = useDataStore(selectFirstError);
 */
export const selectFirstError = (state) => {
  const values = Object.values(state.errors);
  return values.find(v => v !== null) || null;
};
