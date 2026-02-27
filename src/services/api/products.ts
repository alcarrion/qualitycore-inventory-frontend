// ============================================================
// services/api/products.ts
// ============================================================

import { apiFetch, apiFetchForm } from "./config";
import type { ApiResponse, PaginatedResponse, StockCheckResult } from '../../types/api';
import type { Product } from '../../types/models';

interface CheckStockItem {
  product: number;
  quantity: number;
}

export async function getProducts(
  page: number | null = null,
  options: { signal?: AbortSignal } = {}
): Promise<ApiResponse<PaginatedResponse<Product>>> {
  const url = page ? `/products/?page=${page}` : `/products/`;
  return await apiFetch<PaginatedResponse<Product>>(url, options);
}

export async function postProduct(formData: FormData): Promise<ApiResponse<Product>> {
  return await apiFetchForm<Product>(`/products/`, formData);
}

export async function patchProduct(id: number, formData: FormData): Promise<ApiResponse<Product>> {
  return await apiFetchForm<Product>(`/products/${id}/`, formData, { method: "PATCH" });
}

export async function patchProductJson(
  id: number,
  data: Partial<Product>
): Promise<ApiResponse<Product>> {
  return await apiFetch<Product>(`/products/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function checkStock(
  items: CheckStockItem[]
): Promise<ApiResponse<StockCheckResult>> {
  return await apiFetch<StockCheckResult>(`/products/check-stock/`, {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}
