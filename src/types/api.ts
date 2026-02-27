export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  aborted?: boolean;
  networkError?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface FetchOptions extends Omit<RequestInit, 'signal'> {
  signal?: AbortSignal;
  timeout?: number;
}

export interface StockCheckResult {
  all_available: boolean;
  unavailable: Array<{
    product_id: number;
    product_name: string;
    available: number;
    requested: number;
  }>;
}

export interface FilterParams {
  page?: number | null;
  search?: string;
  start_date?: string;
  end_date?: string;
  no_page?: string;
  type?: string;
  [key: string]: string | number | null | undefined;
}
