// ============================================================
// services/api/suppliers.ts
// ============================================================

import { apiFetch } from "./config";
import type { ApiResponse, PaginatedResponse } from '../../types/api';
import type { Supplier } from '../../types/models';

export async function getSuppliers(
  page: number | null = null,
  options: { signal?: AbortSignal } = {}
): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
  const url = page ? `/suppliers/?page=${page}` : `/suppliers/`;
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
