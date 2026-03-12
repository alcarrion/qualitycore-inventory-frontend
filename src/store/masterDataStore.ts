// store/masterDataStore.ts
// Datos maestros: proveedores, categorías, alertas, dashboard.
// NOTA: products y customers ya no se almacenan en el store global — cada
// dropdown busca de forma lazy via useProductSearch / useCustomerSearch.
// suppliers sí se mantiene en el store porque InventoryPage necesita la lista
// completa para enriquecer nombres de productos y para el filtro de proveedor.
import { create } from 'zustand';
import { logger } from '../utils/logger';
import {
  getSuppliers,
  getCategories,
  getAlerts,
  getDashboardSummary,
} from '../services/api';
import { fetchAllPages } from '../services/api/utils';
import type { Supplier, Category, Alert, DashboardSummary } from '../types/models';

const DEFAULT_DASHBOARD: DashboardSummary = {
  total_products: 0,
  total_customers: 0,
  total_movements: 0,
  total_entries: 0,
  total_exits: 0,
  low_stock_alerts: 0,
  total_sales: 0,
};

const notDeleted = (item: { deleted_at: string | null }): boolean => !item.deleted_at;

interface MasterDataErrors {
  suppliers?: string | null;
  categories?: string | null;
  alerts?: string | null;
  dashboard?: string | null;
  [key: string]: string | null | undefined;
}

interface MasterDataStore {
  suppliers: Supplier[];
  categories: Category[];
  alerts: Alert[];
  dashboardData: DashboardSummary;
  /** Contador de fetches en curso. > 0 significa carga activa. Evita la
   *  race condition de loading: boolean cuando varios fetches corren en paralelo. */
  loadingCount: number;
  errors: MasterDataErrors;

  fetchSuppliers: (signal?: AbortSignal) => Promise<void>;
  fetchCategories: (signal?: AbortSignal) => Promise<void>;
  fetchAlerts: (signal?: AbortSignal) => Promise<void>;
  fetchDashboard: (signal?: AbortSignal) => Promise<void>;
  setAlerts: (alerts: Alert[]) => void;
  clearErrors: () => void;
}

export const useMasterDataStore = create<MasterDataStore>()((set) => ({
  suppliers: [],
  categories: [],
  alerts: [],
  dashboardData: DEFAULT_DASHBOARD,
  loadingCount: 0,
  errors: {},

  fetchSuppliers: async (signal?: AbortSignal): Promise<void> => {
    set((s) => ({ loadingCount: s.loadingCount + 1 }));
    try {
      const all = await fetchAllPages<Supplier>((page) =>
        getSuppliers(page, '', '', signal ? { signal } : {})
      );
      if (all === null) {
        set((s) => ({ loadingCount: Math.max(0, s.loadingCount - 1) }));
        return;
      }
      set((s) => ({
        suppliers: all.filter(notDeleted),
        loadingCount: Math.max(0, s.loadingCount - 1),
        errors: { ...s.errors, suppliers: null },
      }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        set((s) => ({ loadingCount: Math.max(0, s.loadingCount - 1) }));
        return;
      }
      logger.error('Error fetching suppliers:', error);
      set((s) => ({
        loadingCount: Math.max(0, s.loadingCount - 1),
        errors: { ...s.errors, suppliers: 'Error al cargar proveedores' },
      }));
    }
  },

  fetchCategories: async (signal?: AbortSignal): Promise<void> => {
    set((s) => ({ loadingCount: s.loadingCount + 1 }));
    try {
      const all = await fetchAllPages<Category>((page) =>
        getCategories(page, '', '', signal ? { signal } : {})
      );
      if (all === null) {
        set((s) => ({ loadingCount: Math.max(0, s.loadingCount - 1) }));
        return;
      }
      set((s) => ({
        categories: all,
        loadingCount: Math.max(0, s.loadingCount - 1),
        errors: { ...s.errors, categories: null },
      }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        set((s) => ({ loadingCount: Math.max(0, s.loadingCount - 1) }));
        return;
      }
      logger.error('Error fetching categories:', error);
      set((s) => ({
        loadingCount: Math.max(0, s.loadingCount - 1),
        errors: { ...s.errors, categories: 'Error al cargar categorías' },
      }));
    }
  },

  fetchAlerts: async (signal?: AbortSignal): Promise<void> => {
    set((s) => ({ loadingCount: s.loadingCount + 1 }));
    try {
      const res = await getAlerts(undefined, signal ? { signal } : {});
      if (res.aborted) {
        set((s) => ({ loadingCount: Math.max(0, s.loadingCount - 1) }));
        return;
      }
      const alerts = (res.data as Alert[]) ?? [];
      set((s) => ({
        alerts,
        loadingCount: Math.max(0, s.loadingCount - 1),
        errors: { ...s.errors, alerts: null },
      }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        set((s) => ({ loadingCount: Math.max(0, s.loadingCount - 1) }));
        return;
      }
      logger.error('Error fetching alerts:', error);
      set((s) => ({
        loadingCount: Math.max(0, s.loadingCount - 1),
        errors: { ...s.errors, alerts: 'Error al cargar alertas' },
      }));
    }
  },

  fetchDashboard: async (signal?: AbortSignal): Promise<void> => {
    set((s) => ({ loadingCount: s.loadingCount + 1 }));
    try {
      const res = await getDashboardSummary(undefined, signal ? { signal } : {});
      if (res.aborted) {
        set((s) => ({ loadingCount: Math.max(0, s.loadingCount - 1) }));
        return;
      }
      if (res.ok && res.data) {
        set((s) => ({
          dashboardData: res.data as DashboardSummary,
          loadingCount: Math.max(0, s.loadingCount - 1),
        }));
      } else {
        set((s) => ({ loadingCount: Math.max(0, s.loadingCount - 1) }));
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        set((s) => ({ loadingCount: Math.max(0, s.loadingCount - 1) }));
        return;
      }
      logger.error('Error fetching dashboard:', error);
      set((s) => ({
        loadingCount: Math.max(0, s.loadingCount - 1),
        errors: { ...s.errors, dashboard: 'Error al cargar dashboard' },
      }));
    }
  },

  setAlerts: (alerts: Alert[]): void => set({ alerts }),
  clearErrors: (): void => set({ errors: {} }),
}));

/** Selector: retorna el primer error activo de datos maestros. */
export const selectMasterDataError = (state: MasterDataStore): string | null =>
  Object.values(state.errors).find((v): v is string => v !== null && v !== undefined) ?? null;

/** Selector: true mientras cualquier fetch del store está en curso. */
export const selectMasterDataLoading = (state: MasterDataStore): boolean =>
  state.loadingCount > 0;
