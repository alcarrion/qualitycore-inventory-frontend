// src/utils/errorHandler.ts
import { ERRORS } from '../constants/messages';
import { logger } from './logger';
import { clearSession } from '../services/authService';
import type { ToastType } from '../types/ui';

/**
 * Manejo centralizado de errores de API
 */

// Variable global para almacenar la función showToast
// Se inicializa desde App.js con addToast del AppContext
let showToastFn: ((type: ToastType, message: string) => void) | null = null;

export function setToastHandler(fn: (type: ToastType, message: string) => void): void {
  showToastFn = fn;
}

/**
 * Mensajes de error por código HTTP
 */
const HTTP_ERROR_MESSAGES: Record<number, string> = {
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
 */
export function handleApiError(response: { status: number }, data: unknown): string {
  if (response.status === 401) {
    clearSession();
    window.location.href = "/";
    return HTTP_ERROR_MESSAGES[401];
  }

  if (HTTP_ERROR_MESSAGES[response.status]) {
    return HTTP_ERROR_MESSAGES[response.status];
  }

  if (response.status >= 500) {
    return ERRORS.SERVER_ERROR;
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (obj['detail']) {
      const detail = obj['detail'];
      return Array.isArray(detail) ? String(detail[0]) : String(detail);
    }
    if (obj['message']) return String(obj['message']);

    const fieldErrors = Object.entries(obj)
      .filter(([key]) => key !== 'message')
      .map(([, messages]) => (Array.isArray(messages) ? messages[0] : messages))
      .filter(Boolean);
    if (fieldErrors.length > 0) return String(fieldErrors[0]);
  }

  return 'Ha ocurrido un error. Por favor intenta nuevamente.';
}

/**
 * Extrae errores de validación de una respuesta de API de formulario.
 */
export function extractFormErrors(responseData: unknown, fallbackMessage: string): string {
  if (!responseData) return fallbackMessage;

  if (typeof responseData === 'string') return responseData;

  if (responseData && typeof responseData === 'object') {
    const obj = responseData as Record<string, unknown>;

    if (obj['detail']) {
      if (Array.isArray(obj['detail'])) return (obj['detail'] as string[]).join('. ');
      return String(obj['detail']);
    }

    const errorMessages = Object.entries(obj)
      .map(([, messages]) => {
        if (Array.isArray(messages)) return (messages as string[]).join(', ');
        return String(messages);
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
export function showErrorToast(message: string): void {
  if (showToastFn) {
    showToastFn("error", message);
  } else {
    logger.error(message);
  }
}

/**
 * Muestra un toast de éxito
 */
export function showSuccessToast(message: string): void {
  if (showToastFn) {
    showToastFn("success", message);
  }
}

/**
 * Muestra un toast de advertencia
 */
export function showWarningToast(message: string): void {
  if (showToastFn) {
    showToastFn("warning", message);
  }
}

/**
 * Maneja errores de red (fetch falló)
 */
export function handleNetworkError(): string {
  showErrorToast(ERRORS.NETWORK_ERROR);
  return ERRORS.NETWORK_ERROR;
}
