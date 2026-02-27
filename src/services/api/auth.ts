// ============================================================
// services/api/auth.ts
// ============================================================

import { apiFetch, initCsrf } from "./config";
import { clearSession } from "../authService";
import type { ApiResponse } from '../../types/api';
import type { User } from '../../types/models';

export async function loginUser(email: string, password: string): Promise<ApiResponse<{ user: User }>> {
  const r = await apiFetch<{ user: User }>(`/login/`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (r.ok) await initCsrf();
  return r;
}

export async function logoutUser(): Promise<void> {
  try {
    await apiFetch(`/logout/`, { method: "POST" });
  } catch {
    // Aunque falle la petición, limpiar estado local
  }
  clearSession();
}

export async function forgotPassword(email: string): Promise<ApiResponse> {
  return await apiFetch(`/forgot-password/`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function changePassword(old_password: string, new_password: string): Promise<ApiResponse> {
  return await apiFetch(`/change-password/`, {
    method: "POST",
    body: JSON.stringify({ old_password, new_password }),
  });
}

export async function postResetPassword(payload: Record<string, string>): Promise<ApiResponse> {
  return await apiFetch(`/reset-password/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
