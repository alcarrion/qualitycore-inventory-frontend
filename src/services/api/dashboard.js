// ============================================================
// services/api/dashboard.js
// Funciones para datos del dashboard
// ============================================================

import { apiFetch } from "./config";

/** Resumen del dashboard */
export async function getDashboardSummary(_, options = {}) {
  return await apiFetch(`/dashboard/summary/`, options);
}
