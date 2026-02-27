// ============================================================
// services/api/categories.ts
// ============================================================

import { apiFetch } from "./config";
import type { ApiResponse, PaginatedResponse, FetchOptions } from '../../types/api';
import type { Category } from '../../types/models';

export async function getCategories(
  _?: unknown,
  options: FetchOptions = {}
): Promise<ApiResponse<PaginatedResponse<Category>>> {
  return await apiFetch<PaginatedResponse<Category>>(`/categories/`, options);
}

export async function postCategory(name: string): Promise<ApiResponse<Category>> {
  return await apiFetch<Category>(`/categories/`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}
