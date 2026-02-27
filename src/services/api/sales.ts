// ============================================================
// services/api/sales.ts
// ============================================================

import { apiFetch } from "./config";
import type { ApiResponse, PaginatedResponse, FilterParams } from '../../types/api';
import type { Sale } from '../../types/models';

export async function getSales(
  params: FilterParams = {},
  options: { signal?: AbortSignal } = {}
): Promise<ApiResponse<PaginatedResponse<Sale>>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.search) query.set('search', String(params.search));
  if (params.start_date) query.set('start_date', String(params.start_date));
  if (params.end_date) query.set('end_date', String(params.end_date));
  if (params.no_page) query.set('no_page', String(params.no_page));
  const qs = query.toString();
  return await apiFetch<PaginatedResponse<Sale>>(`/sales/${qs ? `?${qs}` : ''}`, options);
}

export async function postSale(
  data: { customer: number; items: Array<{ product: number; quantity: number }> }
): Promise<ApiResponse<{ message: string; sale: Sale }>> {
  return await apiFetch<{ message: string; sale: Sale }>(`/sales/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getSale(id: number): Promise<ApiResponse<Sale>> {
  return await apiFetch<Sale>(`/sales/${id}/`);
}
