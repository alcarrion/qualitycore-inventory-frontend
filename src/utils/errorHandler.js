// src/utils/errorHandler.js
import { ERRORS } from '../constants/messages';

/**
 * Manejo centralizado de errores de API
 * Este archivo exporta funciones para manejar errores comunes
 */

// Variable global para almacenar la función showToast
// Se inicializa desde App.js con addToast del AppContext
let showToastFn = null;

export function setToastHandler(fn) {
  showToastFn = fn;
}

/**
 * Mensajes de error por código HTTP
 */
const HTTP_ERROR_MESSAGES = {
  401: ERRORS.SESSION_EXPIRED,
  403: ERRORS.NO_PERMISSION,
  404: 'El recurso solicitado no fue encontrado.',
  408: ERRORS.NETWORK_ERROR,
  429: 'Demasiadas solicitudes. Por favor espera un momento.',
  500: ERRORS.SERVER_ERROR,
  502: ERRORS.SERVER_ERROR,
  503: ERRORS.SERVER_ERROR,
  504: ERRORS.SERVER_ERROR,
};

/**
 * Maneja errores de red y del servidor
 * @param {Response} response - Respuesta de fetch
 * @param {any} data - Datos parseados de la respuesta
 * @returns {string} Mensaje de error formateado
 */
export function handleApiError(response, data) {
  // Error 401 - No autenticado (manejado por JWT refresh, esto es fallback)
  if (response.status === 401) {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/";
    return HTTP_ERROR_MESSAGES[401];
  }

  // Buscar mensaje por código HTTP
  if (HTTP_ERROR_MESSAGES[response.status]) {
    return HTTP_ERROR_MESSAGES[response.status];
  }

  // Error 5xx genérico
  if (response.status >= 500) {
    return ERRORS.SERVER_ERROR;
  }

  // Intentar extraer mensaje del backend
  if (data && typeof data === "object") {
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.detail) return data.detail;

    // Errores de validación de campos
    if (data.errors) {
      const firstError = Object.values(data.errors)[0];
      return Array.isArray(firstError) ? firstError[0] : firstError;
    }
  }

  return 'Ha ocurrido un error. Por favor intenta nuevamente.';
}

/**
 * Muestra un toast de error
 */
export function showErrorToast(message) {
  if (showToastFn) {
    showToastFn("error", message);
  } else {
    console.error(message);
  }
}

/**
 * Muestra un toast de éxito
 */
export function showSuccessToast(message) {
  if (showToastFn) {
    showToastFn("success", message);
  }
}

/**
 * Muestra un toast de advertencia
 */
export function showWarningToast(message) {
  if (showToastFn) {
    showToastFn("warning", message);
  }
}

/**
 * Maneja errores de red (fetch falló)
 */
export function handleNetworkError() {
  showErrorToast(ERRORS.NETWORK_ERROR);
  return ERRORS.NETWORK_ERROR;
}
