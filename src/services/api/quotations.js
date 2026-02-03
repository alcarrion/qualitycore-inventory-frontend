// ============================================================
// services/api/quotations.js
// Funciones para gestión de cotizaciones y generación de PDFs
// ============================================================

import { apiFetch } from "./config";

/** Crear cotización */
export async function postQuotation(data) {
  return await apiFetch(`/quotations/create/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * getQuotationPDF
 * - Inicia generación asíncrona de PDF con Celery
 * - Retorna task_id para consultar el estado
 */
export async function getQuotationPDF(quotationId) {
  return await apiFetch(`/quotations/pdf/${quotationId}/`, {
    method: "POST",
  });
}

/**
 * checkPDFStatus
 * - Consulta el estado de una tarea de generación de PDF
 * - Retorna { state: "PENDING|STARTED|SUCCESS|FAILURE", download_url?, error? }
 */
export async function checkPDFStatus(taskId) {
  return await apiFetch(`/quotations/pdf/status/${taskId}/`);
}
