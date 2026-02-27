// ============================================================
// services/api/purchases.ts
// ============================================================

import { apiFetch } from "./config";
import type { ApiResponse, PaginatedResponse, FilterParams } from '../../types/api';
import type { Purchase } from '../../types/models';

export async function getPurchases(
  params: FilterParams = {},
  options: { signal?: AbortSignal } = {}
): Promise<ApiResponse<PaginatedResponse<Purchase>>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.search) query.set('search', String(params.search));
  if (params.start_date) query.set('start_date', String(params.start_date));
  if (params.end_date) query.set('end_date', String(params.end_date));
  if (params.no_page) query.set('no_page', String(params.no_page));
  const qs = query.toString();
  return await apiFetch<PaginatedResponse<Purchase>>(`/purchases/${qs ? `?${qs}` : ''}`, options);
}

export async function postPurchase(
  data: { supplier: number; items: Array<{ product: number; quantity: number }> }
): Promise<ApiResponse<{ message: string; purchase: Purchase }>> {
  return await apiFetch<{ message: string; purchase: Purchase }>(`/purchases/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPurchase(id: number): Promise<ApiResponse<Purchase>> {
  return await apiFetch<Purchase>(`/purchases/${id}/`);
}
