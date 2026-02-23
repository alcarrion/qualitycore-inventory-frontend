// src/utils/errorHandler.js
import { ERRORS } from '../constants/messages';
import { logger } from './logger';
import { clearSession } from '../services/authService';

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
    clearSession();
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

  // Intentar extraer mensaje del backend (prioridad: detail > message)
  if (data && typeof data === "object") {
    // 'detail' es el estándar de DRF para errores
    if (data.detail) {
      return Array.isArray(data.detail) ? data.detail[0] : data.detail;
    }
    if (data.message) return data.message;

    // Errores de validación de campos (DRF serializer errors)
    const fieldErrors = Object.entries(data)
      .filter(([key]) => key !== 'message')
      .map(([, messages]) => (Array.isArray(messages) ? messages[0] : messages))
      .filter(Boolean);
    if (fieldErrors.length > 0) return fieldErrors[0];
  }

  return 'Ha ocurrido un error. Por favor intenta nuevamente.';
}

/**
 * Extrae errores de validación de una respuesta de API de formulario.
 * Maneja los formatos comunes del backend Django REST Framework:
 * - { "detail": "mensaje" }
 * - { "campo": ["error1", "error2"], "otro_campo": ["error"] }
 * - { "non_field_errors": ["error"] }
 *
 * @param {object} responseData - resp.data de la respuesta
 * @param {string} fallbackMessage - Mensaje si no se puede extraer un error
 * @returns {string} Mensaje de error formateado
 */
export function extractFormErrors(responseData, fallbackMessage) {
  if (!responseData) return fallbackMessage;

  // Si es string directo
  if (typeof responseData === 'string') return responseData;

  // Si tiene detail (error general de DRF — puede ser string o array)
  if (responseData.detail) {
    if (Array.isArray(responseData.detail)) return responseData.detail.join('. ');
    return responseData.detail;
  }

  // Iterar campos del objeto para extraer errores de validación
  if (typeof responseData === 'object') {
    const errorMessages = Object.entries(responseData)
      .map(([, messages]) => {
        if (Array.isArray(messages)) return messages.join(', ');
        return messages;
      })
      .filter(Boolean)
      .join('. ');

    if (errorMessages) return errorMessages;
  }

  return fallbackMessage;
}

/**
 * Muestra un toast de error
 */
export function showErrorToast(message) {
  if (showToastFn) {
    showToastFn("error", message);
  } else {
    logger.error(message);
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
