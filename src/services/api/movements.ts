// ============================================================
// services/api/movements.ts
// ============================================================

import { apiFetch } from "./config";
import type { ApiResponse, PaginatedResponse, FilterParams, FetchOptions } from '../../types/api';
import type { Movement } from '../../types/models';

export async function getMovements(
  params: FilterParams = {},
  options: FetchOptions = {}
): Promise<ApiResponse<PaginatedResponse<Movement>>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.type) query.set('type', String(params.type));
  const qs = query.toString();
  return await apiFetch<PaginatedResponse<Movement>>(
    `/movements/${qs ? `?${qs}` : ''}`,
    options
  );
}

export async function postMovement(data: Partial<Movement>): Promise<ApiResponse<Movement>> {
  return await apiFetch<Movement>(`/movements/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function postAdjustment(
  data: { product: number; quantity: number; reason: string }
): Promise<ApiResponse<Movement>> {
  return await apiFetch<Movement>(`/movements/adjustments/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function postCorrection(
  movementId: number,
  data: Record<string, unknown>
): Promise<ApiResponse<Movement>> {
  return await apiFetch<Movement>(`/movements/${movementId}/correct/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
