import type {
  Supplier,
  Category,
  Alert,
  DashboardSummary,
  Sale,
  Purchase,
  Movement,
  AppConfig,
} from './models';
import type { FilterParams } from './api';

export interface StoreErrors {
  suppliers?: string | null;
  categories?: string | null;
  alerts?: string | null;
  dashboard?: string | null;
  sales?: string | null;
  purchases?: string | null;
  movements?: string | null;
  config?: string | null;
  [key: string]: string | null | undefined;
}

export interface DataStoreState {
  appConfig: AppConfig;
  configLoaded: boolean;
  suppliers: Supplier[];
  categories: Category[];
  alerts: Alert[];
  dashboardData: DashboardSummary;
  sales: Sale[];
  salesCount: number;
  purchases: Purchase[];
  purchasesCount: number;
  movements: Movement[];
  movementsCount: number;
  /** Contador de fetches activos; reemplaza loading: boolean para evitar race conditions. */
  loadingCount: number;
  errors: StoreErrors;
}

export interface DataStoreActions {
  fetchAppConfig: (signal?: AbortSignal) => Promise<void>;
  fetchSuppliers: (signal?: AbortSignal) => Promise<void>;
  fetchCategories: (signal?: AbortSignal) => Promise<void>;
  fetchAlerts: (signal?: AbortSignal) => Promise<void>;
  fetchSales: (params?: FilterParams, signal?: AbortSignal) => Promise<void>;
  fetchPurchases: (params?: FilterParams, signal?: AbortSignal) => Promise<void>;
  fetchMovements: (params?: FilterParams, signal?: AbortSignal) => Promise<void>;
  fetchDashboard: (signal?: AbortSignal) => Promise<void>;
  fetchAll: (signal?: AbortSignal) => Promise<void>;
  setAlerts: (alerts: Alert[]) => void;
  clearErrors: () => void;
}

export type DataStore = DataStoreState & DataStoreActions;
