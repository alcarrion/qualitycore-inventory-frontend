// ============================================================
// services/api/users.ts
// ============================================================

import { apiFetch } from "./config";
import type { ApiResponse, FetchOptions } from '../../types/api';
import type { User } from '../../types/models';

export async function getUsers(options: FetchOptions = {}): Promise<ApiResponse<User[]>> {
  return await apiFetch<User[]>(`/users/`, options);
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
