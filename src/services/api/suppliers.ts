// ============================================================
// services/api/suppliers.ts
// ============================================================

import { apiFetch } from "./config";
import type { ApiResponse, PaginatedResponse } from '../../types/api';
import type { Supplier } from '../../types/models';

export async function getSuppliers(
  page: number | null = null,
  search: string = '',
  ordering: string = '',
  options: { signal?: AbortSignal } = {}
): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
  const params = new URLSearchParams();
  if (page) params.set('page', String(page));
  if (search) params.set('search', search);
  if (ordering) params.set('ordering', ordering);
  const query = params.toString();
  const url = `/suppliers/${query ? `?${query}` : ''}`;
  return await apiFetch<PaginatedResponse<Supplier>>(url, options);
}

export async function postSupplier(data: Partial<Supplier>): Promise<ApiResponse<Supplier>> {
  return await apiFetch<Supplier>(`/suppliers/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function patchSupplier(
  id: number,
  data: Partial<Supplier>
): Promise<ApiResponse<Supplier>> {
  return await apiFetch<Supplier>(`/suppliers/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
