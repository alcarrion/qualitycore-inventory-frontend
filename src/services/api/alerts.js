// ============================================================
// services/api/alerts.js
// Funciones para gestión de alertas
// ============================================================

import { apiFetch } from "./config";

/** Listar alertas */
export async function getAlerts() {
  return await apiFetch(`/alerts/`);
}

/** Descartar alerta */
export async function dismissAlert(alertId) {
  return await apiFetch(`/alerts/${alertId}/dismiss/`, { method: "PATCH" });
}
