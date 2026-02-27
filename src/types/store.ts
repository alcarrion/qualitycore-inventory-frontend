import type {
  Product,
  Supplier,
  Category,
  Customer,
  Alert,
  DashboardSummary,
  Sale,
  Purchase,
  Movement,
  AppConfig,
} from './models';
import type { FilterParams } from './api';

export interface StoreErrors {
  products?: string | null;
  suppliers?: string | null;
  categories?: string | null;
  customers?: string | null;
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
  products: Product[];
  suppliers: Supplier[];
  categories: Category[];
  customers: Customer[];
  alerts: Alert[];
  dashboardData: DashboardSummary;
  sales: Sale[];
  salesCount: number;
  purchases: Purchase[];
  purchasesCount: number;
  movements: Movement[];
  movementsCount: number;
  loading: boolean;
  errors: StoreErrors;
}

export interface DataStoreActions {
  fetchAppConfig: (signal?: AbortSignal) => Promise<void>;
  fetchProducts: (signal?: AbortSignal) => Promise<void>;
  fetchSuppliers: (signal?: AbortSignal) => Promise<void>;
  fetchCustomers: (signal?: AbortSignal) => Promise<void>;
  fetchCategories: (signal?: AbortSignal) => Promise<void>;
  fetchAlerts: (signal?: AbortSignal) => Promise<void>;
  fetchSales: (params?: FilterParams, signal?: AbortSignal) => Promise<void>;
  fetchPurchases: (params?: FilterParams, signal?: AbortSignal) => Promise<void>;
  fetchMovements: (params?: FilterParams, signal?: AbortSignal) => Promise<void>;
  fetchDashboard: (signal?: AbortSignal) => Promise<void>;
  fetchAll: (signal?: AbortSignal) => Promise<void>;
  setAlerts: (alerts: Alert[]) => void;
  setProducts: (products: Product[]) => void;
  setCustomers: (customers: Customer[]) => void;
  clearErrors: () => void;
}

export type DataStore = DataStoreState & DataStoreActions;
