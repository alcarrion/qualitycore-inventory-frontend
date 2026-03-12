// ============================================================
// services/api/categories.ts
// ============================================================

import { apiFetch } from "./config";
import type { ApiResponse, PaginatedResponse, FetchOptions } from '../../types/api';
import type { Category } from '../../types/models';

export async function getCategories(
  page: number | null = null,
  search = '',
  ordering = '',
  options: FetchOptions = {}
): Promise<ApiResponse<PaginatedResponse<Category>>> {
  const params = new URLSearchParams();
  if (page) params.set('page', String(page));
  if (search) params.set('search', search);
  if (ordering) params.set('ordering', ordering);
  const qs = params.toString();
  return await apiFetch<PaginatedResponse<Category>>(
    `/categories/${qs ? `?${qs}` : ''}`,
    options
  );
}

export async function postCategory(name: string): Promise<ApiResponse<Category>> {
  return await apiFetch<Category>(`/categories/`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function patchCategory(
  id: number,
  data: Record<string, unknown>
): Promise<ApiResponse<Category>> {
  return await apiFetch<Category>(`/categories/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
