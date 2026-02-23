// ============================================================
// services/api/reports.js
// Funciones para gestión de reportes
// ============================================================

import { apiFetch } from "./config";

/** Listar historial de reportes */
export async function getReports() {
  return await apiFetch(`/reports/`);
}

/** Generar reporte (alias 1) */
export async function postReport(data) {
  return await apiFetch(`/reports/generate/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Generar reporte (alias 2, mismo endpoint que arriba) */
export async function generateReport(payload) {
  return await apiFetch(`/reports/generate/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Consultar estado de generación de reporte */
export async function checkReportStatus(taskId) {
  return await apiFetch(`/reports/status/${taskId}/`);
}
