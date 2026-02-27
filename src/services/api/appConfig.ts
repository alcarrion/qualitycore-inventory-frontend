// ============================================================
// services/api/appConfig.ts
// ============================================================

import { apiFetch } from "./config";
import type { ApiResponse, FetchOptions } from '../../types/api';
import type { AppConfig } from '../../types/models';

export async function getAppConfig(options: FetchOptions = {}): Promise<ApiResponse<AppConfig>> {
  return await apiFetch<AppConfig>(`/config/`, options);
}
