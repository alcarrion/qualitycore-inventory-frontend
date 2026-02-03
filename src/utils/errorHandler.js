// src/utils/errorHandler.js

/**
 * Manejo centralizado de errores de API
 * Este archivo exporta funciones para manejar errores comunes
 */

// Variable global para almacenar la función showToast
// Se inicializa desde App.js
let showToastFn = null;

export function setToastHandler(fn) {
  showToastFn = fn;
}

/**
 * Maneja errores de red y del servidor
 * @param {Response} response - Respuesta de fetch
 * @param {any} data - Datos parseados de la respuesta
 * @returns {string} Mensaje de error formateado
 */
export function handleApiError(response, data) {
  // Error 401 - No autenticado
  if (response.status === 401) {
    // Limpiar sesión y redirigir al login
    localStorage.removeItem("user");
    window.location.href = "/login";
    return "Sesión expirada. Por favor inicia sesión nuevamente.";
  }

  // Error 403 - Sin permisos
  if (response.status === 403) {
    return "No tienes permisos para realizar esta acción.";
  }

  // Error 404 - No encontrado
  if (response.status === 404) {
    return "El recurso solicitado no fue encontrado.";
  }

  // Error 500 - Error del servidor
  if (response.status >= 500) {
    return "Error del servidor. Por favor intenta más tarde.";
  }

  // Otros errores - Intentar extraer mensaje del backend
  if (data && typeof data === "object") {
    // Si hay un mensaje directo
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.detail) return data.detail;

    // Si hay errores de validación de campos
    if (data.errors) {
      const firstError = Object.values(data.errors)[0];
      return Array.isArray(firstError) ? firstError[0] : firstError;
    }
  }

  return "Ha ocurrido un error. Por favor intenta nuevamente.";
}

/**
 * Muestra un toast de error
 * @param {string} message - Mensaje de error
 */
export function showErrorToast(message) {
  if (showToastFn) {
    showToastFn("error", message);
  } else {
    // Fallback a alert si no hay toast disponible
    console.error(message);
    alert(message);
  }
}

/**
 * Muestra un toast de éxito
 * @param {string} message - Mensaje de éxito
 */
export function showSuccessToast(message) {
  if (showToastFn) {
    showToastFn("success", message);
  }
}

/**
 * Maneja errores de red (fetch falló)
 */
export function handleNetworkError() {
  const message = "Error de conexión. Verifica tu conexión a internet.";
  showErrorToast(message);
  return message;
}
