// ============================================================
// store/dataStore.ts
// Estado global centralizado con Zustand
//
// CONVENCIÓN DE ESTADO:
//   - Zustand: datos de negocio (productos, clientes, ventas, etc.)
//   - AppContext: estado de UI (toasts, loading, dark mode)
//   - authService + App.js useState: datos de usuario autenticado
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
import type { DataStore } from '../types/store';
import type {
  Product,
  Supplier,
  Customer,
  Category,
  Alert,
  AppConfig,
  DashboardSummary,
  Sale,
  Purchase,
  Movement,
} from '../types/models';
import type { FilterParams } from '../types/api';

// Contador para deduplicar fetchAll
let fetchAllCounter = 0;

const notDeleted = (item: { deleted_at: string | null }): boolean => !item.deleted_at;

/**
 * Helper: Carga todas las páginas de un endpoint paginado
 */
async function fetchAllPages<T>(
  fetchFn: (page: number) => Promise<{ ok: boolean; data: { results?: T[]; next?: string | null } | T[] | null; aborted?: boolean }>
): Promise<T[] | null> {
  const allItems: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await fetchFn(page);
    if (res.aborted) return null;
    const data = res.data;
    const results: T[] = Array.isArray(data)
      ? data
      : ((data as { results?: T[] })?.results ?? []);

    if (Array.isArray(results) && results.length > 0) {
      allItems.push(...results);
      hasMore = !!(data as { next?: string | null })?.next;
      page++;
    } else {
      hasMore = false;
    }
  }

  return allItems;
}

const DEFAULT_CONFIG: AppConfig = {
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
};

const DEFAULT_DASHBOARD: DashboardSummary = {
  total_products: 0,
  total_customers: 0,
  total_movements: 0,
  total_entries: 0,
  total_exits: 0,
  low_stock_alerts: 0,
  total_sales: 0,
};

/**
 * Store global de datos de la aplicación
 */
export const useDataStore = create<DataStore>()((set, get) => ({
  // ==================== ESTADO ====================

  appConfig: DEFAULT_CONFIG,
  configLoaded: false,

  products: [],
  suppliers: [],
  categories: [],
  customers: [],

  alerts: [],
  dashboardData: DEFAULT_DASHBOARD,

  sales: [],
  salesCount: 0,
  purchases: [],
  purchasesCount: 0,
  movements: [],
  movementsCount: 0,

  loading: false,
  errors: {},

  // ==================== ACCIONES ====================

  fetchAppConfig: async (signal?: AbortSignal): Promise<void> => {
    try {
      const res = await getAppConfig(signal ? { signal } : {});
      if (res.aborted) return;
      if (res.ok && res.data) {
        set({ appConfig: res.data as AppConfig, configLoaded: true });
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      logger.error('Error fetching app config:', error);
    }
  },

  fetchProducts: async (signal?: AbortSignal): Promise<void> => {
    try {
      const all = await fetchAllPages<Product>((page) =>
        getProducts(page, signal ? { signal } : {})
      );
      if (all === null) return;
      set((state) => ({
        products: all.filter(notDeleted),
        errors: { ...state.errors, products: null },
      }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      logger.error('Error fetching products:', error);
      set((state) => ({ errors: { ...state.errors, products: 'Error al cargar productos' } }));
    }
  },

  fetchSuppliers: async (signal?: AbortSignal): Promise<void> => {
    try {
      const all = await fetchAllPages<Supplier>((page) =>
        getSuppliers(page, signal ? { signal } : {})
      );
      if (all === null) return;
      set((state) => ({
        suppliers: all.filter(notDeleted),
        errors: { ...state.errors, suppliers: null },
      }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      logger.error('Error fetching suppliers:', error);
      set((state) => ({ errors: { ...state.errors, suppliers: 'Error al cargar proveedores' } }));
    }
  },

  fetchCustomers: async (signal?: AbortSignal): Promise<void> => {
    try {
      const all = await fetchAllPages<Customer>((page) =>
        getCustomers(page, signal ? { signal } : {})
      );
      if (all === null) return;
      set((state) => ({
        customers: all.filter(notDeleted),
        errors: { ...state.errors, customers: null },
      }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      logger.error('Error fetching customers:', error);
      set((state) => ({ errors: { ...state.errors, customers: 'Error al cargar clientes' } }));
    }
  },

  fetchCategories: async (signal?: AbortSignal): Promise<void> => {
    try {
      const res = await getCategories(undefined, signal ? { signal } : {});
      if (res.aborted) return;
      const data = res.data;
      const list: Category[] = Array.isArray(data)
        ? data
        : ((data as { results?: Category[] })?.results ?? []);
      set((state) => ({
        categories: Array.isArray(list) ? list : [],
        errors: { ...state.errors, categories: null },
      }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      logger.error('Error fetching categories:', error);
      set((state) => ({ errors: { ...state.errors, categories: 'Error al cargar categorías' } }));
    }
  },

  fetchAlerts: async (signal?: AbortSignal): Promise<void> => {
    try {
      const res = await getAlerts(undefined, signal ? { signal } : {});
      if (res.aborted) return;
      const data = res.data;
      const list: Alert[] = Array.isArray(data)
        ? (data as Alert[])
        : ((data as { results?: Alert[] } | null)?.results ?? []);
      set((state) => ({
        alerts: Array.isArray(list) ? list : [],
        errors: { ...state.errors, alerts: null },
      }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      logger.error('Error fetching alerts:', error);
      set((state) => ({ errors: { ...state.errors, alerts: 'Error al cargar alertas' } }));
    }
  },

  fetchSales: async (params: FilterParams = {}, signal?: AbortSignal): Promise<void> => {
    try {
      const res = await getSales(params, signal ? { signal } : {});
      if (res.aborted) return;
      const results: Sale[] = (res.data as { results?: Sale[] })?.results ?? [];
      const count: number = (res.data as { count?: number })?.count ?? 0;
      set((state) => ({
        sales: results,
        salesCount: count,
        errors: { ...state.errors, sales: null },
      }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      logger.error('Error fetching sales:', error);
      set((state) => ({ errors: { ...state.errors, sales: 'Error al cargar ventas' } }));
    }
  },

  fetchPurchases: async (params: FilterParams = {}, signal?: AbortSignal): Promise<void> => {
    try {
      const res = await getPurchases(params, signal ? { signal } : {});
      if (res.aborted) return;
      const results: Purchase[] = (res.data as { results?: Purchase[] })?.results ?? [];
      const count: number = (res.data as { count?: number })?.count ?? 0;
      set((state) => ({
        purchases: results,
        purchasesCount: count,
        errors: { ...state.errors, purchases: null },
      }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      logger.error('Error fetching purchases:', error);
      set((state) => ({ errors: { ...state.errors, purchases: 'Error al cargar compras' } }));
    }
  },

  fetchMovements: async (params: FilterParams = {}, signal?: AbortSignal): Promise<void> => {
    try {
      const res = await getMovements(params, signal ? { signal } : {});
      if (res.aborted) return;
      const results: Movement[] = (res.data as { results?: Movement[] })?.results ?? [];
      const count: number = (res.data as { count?: number })?.count ?? 0;
      set((state) => ({
        movements: results,
        movementsCount: count,
        errors: { ...state.errors, movements: null },
      }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      logger.error('Error fetching movements:', error);
      set((state) => ({ errors: { ...state.errors, movements: 'Error al cargar movimientos' } }));
    }
  },

  fetchDashboard: async (signal?: AbortSignal): Promise<void> => {
    try {
      const res = await getDashboardSummary(undefined, signal ? { signal } : {});
      if (res.aborted) return;
      if (res.ok && res.data) {
        set({ dashboardData: res.data as DashboardSummary });
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      logger.error('Error fetching dashboard:', error);
      set((state) => ({ errors: { ...state.errors, dashboard: 'Error al cargar dashboard' } }));
    }
  },

  fetchAll: async (signal?: AbortSignal): Promise<void> => {
    const thisCall = ++fetchAllCounter;
    set({ loading: true, errors: {} });
    try {
      const store = get();
      await store.fetchAppConfig(signal);
      if (thisCall !== fetchAllCounter) return;

      await Promise.all([
        store.fetchProducts(signal),
        store.fetchSuppliers(signal),
        store.fetchCategories(signal),
        store.fetchCustomers(signal),
        store.fetchAlerts(signal),
        store.fetchDashboard(signal),
      ]);
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      if (thisCall !== fetchAllCounter) return;
      logger.error('Error in fetchAll:', error);
      set((state) => ({ errors: { ...state.errors, _global: 'Error al cargar datos' } }));
    } finally {
      if (thisCall === fetchAllCounter) {
        set({ loading: false });
      }
    }
  },

  setAlerts: (alerts: Alert[]): void => set({ alerts }),
  setProducts: (products: Product[]): void => set({ products }),
  setCustomers: (customers: Customer[]): void => set({ customers }),

  clearErrors: (): void => set({ errors: {} }),
}));

/**
 * Selector: retorna el primer error activo del mapa de errores.
 */
export const selectFirstError = (state: DataStore): string | null => {
  const values = Object.values(state.errors);
  return values.find((v): v is string => v !== null && v !== undefined) ?? null;
};
