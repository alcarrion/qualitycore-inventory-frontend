// ============================================================
// services/api/alerts.ts
// ============================================================

import { apiFetch } from "./config";
import type { ApiResponse, FetchOptions } from '../../types/api';
import type { Alert } from '../../types/models';

export async function getAlerts(_?: unknown, options: FetchOptions = {}): Promise<ApiResponse<Alert[]>> {
  return await apiFetch<Alert[]>(`/alerts/`, options);
}

export async function dismissAlert(alertId: number): Promise<ApiResponse> {
  return await apiFetch(`/alerts/${alertId}/dismiss/`, { method: "PATCH" });
}
