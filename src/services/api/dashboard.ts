// ============================================================
// services/api/dashboard.ts
// ============================================================

import { apiFetch } from "./config";
import type { ApiResponse, FetchOptions } from '../../types/api';
import type { DashboardSummary } from '../../types/models';

export async function getDashboardSummary(
  _?: unknown,
  options: FetchOptions = {}
): Promise<ApiResponse<DashboardSummary>> {
  return await apiFetch<DashboardSummary>(`/dashboard/summary/`, options);
}
