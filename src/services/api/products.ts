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

interface ProductFetchOptions {
  signal?: AbortSignal;
  search?: string;
  category?: string;
  supplier?: string;
  is_active?: string;
  ordering?: string;
}

export async function getProducts(
  page: number | null = null,
  options: ProductFetchOptions = {}
): Promise<ApiResponse<PaginatedResponse<Product>>> {
  const { signal, search, category, supplier, is_active, ordering } = options;
  const params = new URLSearchParams();
  if (page) params.set('page', String(page));
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  if (supplier) params.set('supplier', supplier);
  if (is_active !== undefined) params.set('is_active', is_active);
  if (ordering) params.set('ordering', ordering);
  const query = params.toString();
  const url = query ? `/products/?${query}` : `/products/`;
  return await apiFetch<PaginatedResponse<Product>>(url, { signal });
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
  return await apiFetch<StockCheckResult>(`/products/check_stock/`, {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}
