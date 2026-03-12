// ============================================================
// services/api/customers.ts
// ============================================================

import { apiFetch } from "./config";
import type { ApiResponse, PaginatedResponse } from '../../types/api';
import type { Customer } from '../../types/models';

export async function getCustomers(
  page: number | null = null,
  search: string = '',
  ordering: string = '',
  options: { signal?: AbortSignal } = {}
): Promise<ApiResponse<PaginatedResponse<Customer>>> {
  const params = new URLSearchParams();
  if (page) params.set('page', String(page));
  if (search) params.set('search', search);
  if (ordering) params.set('ordering', ordering);
  const query = params.toString();
  const url = `/customers/${query ? `?${query}` : ''}`;
  return await apiFetch<PaginatedResponse<Customer>>(url, options);
}

export async function postCustomer(data: Partial<Customer>): Promise<ApiResponse<Customer>> {
  return await apiFetch<Customer>(`/customers/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function patchCustomer(
  id: number,
  data: Partial<Customer>
): Promise<ApiResponse<Customer>> {
  return await apiFetch<Customer>(`/customers/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
