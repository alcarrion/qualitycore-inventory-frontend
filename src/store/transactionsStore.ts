// store/transactionsStore.ts
// Datos transaccionales con filtros server-side: ventas, compras, movimientos.
import { create } from 'zustand';
import { logger } from '../utils/logger';
import { getSales, getPurchases, getMovements } from '../services/api';
import type { Sale, Purchase, Movement } from '../types/models';
import type { FilterParams } from '../types/api';

interface TransactionsErrors {
  sales?: string | null;
  purchases?: string | null;
  movements?: string | null;
  [key: string]: string | null | undefined;
}

interface TransactionsStore {
  sales: Sale[];
  salesCount: number;
  purchases: Purchase[];
  purchasesCount: number;
  movements: Movement[];
  movementsCount: number;
  /** true mientras cualquier fetch del store está en curso */
  loading: boolean;
  errors: TransactionsErrors;

  fetchSales: (params?: FilterParams, signal?: AbortSignal) => Promise<void>;
  fetchPurchases: (params?: FilterParams, signal?: AbortSignal) => Promise<void>;
  fetchMovements: (params?: FilterParams, signal?: AbortSignal) => Promise<void>;
}

export const useTransactionsStore = create<TransactionsStore>()((set) => ({
  sales: [],
  salesCount: 0,
  purchases: [],
  purchasesCount: 0,
  movements: [],
  movementsCount: 0,
  loading: false,
  errors: {},

  fetchSales: async (params: FilterParams = {}, signal?: AbortSignal): Promise<void> => {
    set({ loading: true });
    try {
      const res = await getSales(params, signal ? { signal } : {});
      if (res.aborted) return;
      const results: Sale[] = (res.data as { results?: Sale[] })?.results ?? [];
      const count: number = (res.data as { count?: number })?.count ?? 0;
      set((state) => ({
        sales: results,
        salesCount: count,
        loading: false,
        errors: { ...state.errors, sales: null },
      }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      logger.error('Error fetching sales:', error);
      set((state) => ({ loading: false, errors: { ...state.errors, sales: 'Error al cargar ventas' } }));
    }
  },

  fetchPurchases: async (params: FilterParams = {}, signal?: AbortSignal): Promise<void> => {
    set({ loading: true });
    try {
      const res = await getPurchases(params, signal ? { signal } : {});
      if (res.aborted) return;
      const results: Purchase[] = (res.data as { results?: Purchase[] })?.results ?? [];
      const count: number = (res.data as { count?: number })?.count ?? 0;
      set((state) => ({
        purchases: results,
        purchasesCount: count,
        loading: false,
        errors: { ...state.errors, purchases: null },
      }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      logger.error('Error fetching purchases:', error);
      set((state) => ({ loading: false, errors: { ...state.errors, purchases: 'Error al cargar compras' } }));
    }
  },

  fetchMovements: async (params: FilterParams = {}, signal?: AbortSignal): Promise<void> => {
    set({ loading: true });
    try {
      const res = await getMovements(params, signal ? { signal } : {});
      if (res.aborted) return;
      const results: Movement[] = (res.data as { results?: Movement[] })?.results ?? [];
      const count: number = (res.data as { count?: number })?.count ?? 0;
      set((state) => ({
        movements: results,
        movementsCount: count,
        loading: false,
        errors: { ...state.errors, movements: null },
      }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      logger.error('Error fetching movements:', error);
      set((state) => ({ loading: false, errors: { ...state.errors, movements: 'Error al cargar movimientos' } }));
    }
  },
}));

/** Selector: retorna el primer error activo de transacciones. */
export const selectTransactionsError = (state: TransactionsStore): string | null =>
  Object.values(state.errors).find((v): v is string => v !== null && v !== undefined) ?? null;
