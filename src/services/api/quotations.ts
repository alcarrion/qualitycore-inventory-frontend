// ============================================================
// services/api/quotations.ts
// ============================================================

import { apiFetch } from "./config";
import type { ApiResponse } from '../../types/api';

interface QuotationItem {
  product: number;
  quantity: number;
  unit_price?: number;
  price?: number;
}

interface QuotationData {
  customer: number;
  quoted_products?: QuotationItem[];
  items?: QuotationItem[];
  observations?: string;
  vat?: number;
  [key: string]: unknown;
}

interface TaskResponse {
  task_id: string;
}

interface PDFStatusResponse {
  state: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE';
  download_url?: string;
  error?: string;
}

export async function postQuotation(data: QuotationData): Promise<ApiResponse<{ quotation?: { id: number }; id?: number }>> {
  return await apiFetch<{ quotation?: { id: number }; id?: number }>(`/quotations/create/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getQuotationPDF(quotationId: number): Promise<ApiResponse<TaskResponse>> {
  return await apiFetch<TaskResponse>(`/quotations/pdf/${quotationId}/`, {
    method: "POST",
  });
}

export async function checkPDFStatus(taskId: string): Promise<ApiResponse<PDFStatusResponse>> {
  return await apiFetch<PDFStatusResponse>(`/quotations/pdf/status/${taskId}/`);
}
