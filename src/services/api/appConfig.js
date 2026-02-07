// ============================================================
// services/api/appConfig.js
// Obtener configuración del sistema desde el backend
// ============================================================

import { apiFetch } from "./config";

/**
 * Obtener configuración del sistema
 * Este endpoint no requiere autenticación
 */
export async function getAppConfig() {
  return await apiFetch(`/config/`);
}
