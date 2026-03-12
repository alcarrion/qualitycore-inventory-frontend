// ============================================================
// services/api/users.ts
// ============================================================

import { apiFetch } from "./config";
import type { ApiResponse, FetchOptions } from '../../types/api';
import type { User } from '../../types/models';

export async function getMe(): Promise<ApiResponse<User>> {
  return await apiFetch<User>(`/users/me/`);
}

export async function getUsers(
  ordering: string = '',
  options: FetchOptions = {}
): Promise<ApiResponse<unknown>> {
  const params = new URLSearchParams();
  if (ordering) params.set('ordering', ordering);
  const query = params.toString();
  const url = `/users/${query ? `?${query}` : ''}`;
  return await apiFetch<unknown>(url, options);
}

export async function postUser(data: Partial<User> & { password?: string }): Promise<ApiResponse<User>> {
  return await apiFetch<User>(`/users/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function patchUser(id: number, data: Partial<User>): Promise<ApiResponse<User>> {
  return await apiFetch<User>(`/users/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
