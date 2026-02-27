// ============================================================
// services/api/reports.ts
// ============================================================

import { apiFetch } from "./config";
import type { ApiResponse } from '../../types/api';

interface ReportData {
  type?: string;
  start_date?: string;
  end_date?: string;
  [key: string]: unknown;
}

interface TaskResponse {
  task_id: string;
}

interface ReportStatusResponse {
  state: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE';
  download_url?: string;
  error?: string;
}

interface Report {
  id: number;
  type: string;
  status: string;
  created_at: string;
}

export async function getReports(): Promise<ApiResponse<Report[]>> {
  return await apiFetch<Report[]>(`/reports/`);
}

export async function postReport(data: ReportData): Promise<ApiResponse<TaskResponse>> {
  return await apiFetch<TaskResponse>(`/reports/generate/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function generateReport(payload: ReportData): Promise<ApiResponse<TaskResponse>> {
  return await apiFetch<TaskResponse>(`/reports/generate/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function checkReportStatus(taskId: string): Promise<ApiResponse<ReportStatusResponse>> {
  return await apiFetch<ReportStatusResponse>(`/reports/status/${taskId}/`);
}
