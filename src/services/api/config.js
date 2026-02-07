// ============================================================
// services/api/config.js
// Configuración base y utilidades de CSRF/fetch con JWT
// ============================================================

import { RETRY_CONFIG } from '../../constants/config';
import { logger } from '../../utils/logger';

// ===================== CONFIGURACIÓN BASE =====================
export const API_URL = process.env.REACT_APP_API_URL;

// (Opcional) Raíz del backend, por si necesitas enlaces absolutos a /media, etc.
export const API_ROOT = API_URL.replace(/\/api\/?$/, "");

// Guardamos el token CSRF que expone el backend en /csrf/
let CSRF_TOKEN = null;

// Utilidad para unir URL base + endpoint sin barras duplicadas
const join = (b, p) => b.replace(/\/+$/, "") + "/" + p.replace(/^\/+/, "");


// ===================== JWT TOKEN MANAGEMENT =====================

/**
 * setTokens - Guarda los tokens JWT en localStorage
 */
export function setTokens(access, refresh) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

/**
 * getAccessToken - Obtiene el access token actual
 */
export function getAccessToken() {
  return localStorage.getItem("access_token");
}

/**
 * getRefreshToken - Obtiene el refresh token actual
 */
export function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

/**
 * clearTokens - Elimina los tokens (logout)
 */
export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

/**
 * refreshAccessToken - Usa el refresh token para obtener un nuevo access token
 * Retorna true si tuvo éxito, false si no (sesión expirada)
 */
export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(join(API_URL, "/token/refresh/"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(CSRF_TOKEN ? { "X-CSRFToken": CSRF_TOKEN } : {}),
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.access) {
        localStorage.setItem("access_token", data.access);
        // Si el backend rota el refresh token, guardarlo también
        if (data.refresh) {
          localStorage.setItem("refresh_token", data.refresh);
        }
        return true;
      }
    }
    // Si falla el refresh, limpiar tokens (sesión expirada)
    clearTokens();
    return false;
  } catch (e) {
    logger.error("refreshAccessToken failed", e);
    clearTokens();
    return false;
  }
}


// ===================== RETRY LOGIC =====================

/**
 * Espera un tiempo determinado
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Determina si un error es recuperable y amerita reintento
 */
function isRetryableError(error, status, method) {
  // Solo reintentar métodos seguros (GET, HEAD, OPTIONS)
  if (!RETRY_CONFIG.RETRYABLE_METHODS.includes(method.toUpperCase())) {
    return false;
  }

  // Errores de red (fetch falló completamente)
  if (error && !status) {
    return true;
  }

  // Códigos de estado recuperables
  if (status && RETRY_CONFIG.RETRYABLE_STATUS_CODES.includes(status)) {
    return true;
  }

  return false;
}

/**
 * Ejecuta fetch con reintentos automáticos para errores de red
 */
async function fetchWithRetry(fetchFn, method = 'GET', maxRetries = RETRY_CONFIG.MAX_RETRIES) {
  let lastError;
  let lastStatus;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetchFn();

      // Si es exitoso o no es error recuperable, retornar
      if (res.ok || !isRetryableError(null, res.status, method)) {
        return res;
      }

      lastStatus = res.status;

      // Si es recuperable pero es último intento, retornar
      if (attempt === maxRetries) {
        return res;
      }

      // Esperar antes de reintentar (con backoff exponencial)
      await delay(RETRY_CONFIG.RETRY_DELAY * Math.pow(2, attempt));

    } catch (error) {
      lastError = error;

      // Si es error de red y no es último intento, reintentar
      if (attempt < maxRetries && isRetryableError(error, null, method)) {
        await delay(RETRY_CONFIG.RETRY_DELAY * Math.pow(2, attempt));
        continue;
      }

      throw error;
    }
  }

  // No debería llegar aquí, pero por si acaso
  if (lastError) throw lastError;
  throw new Error(`Request failed with status ${lastStatus}`);
}


// ===================== CSRF & FETCH WRAPPERS =====================

/**
 * initCsrf
 * - Pide al backend el token CSRF y lo cachea en memoria.
 * - Se usa al inicio y cuando Django rota el token (por ejemplo, tras login).
 */
export async function initCsrf() {
  try {
    const res = await fetch(`${API_URL}/csrf/`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (data?.csrfToken) CSRF_TOKEN = data.csrfToken;
  } catch (e) {
    logger.error("initCsrf failed", e);
  }
}

/**
 * apiFetch
 * - Envoltorio de fetch que:
 *   a) incluye credenciales (cookies) automáticamente
 *   b) agrega X-CSRFToken si existe
 *   c) agrega Authorization Bearer token si existe (JWT)
 *   d) reintenta automáticamente en errores de red (GET solamente)
 *   e) reintenta 1 vez si recibe 403 por CSRF rotado
 *   f) reintenta 1 vez si recibe 401 con refresh token
 *   g) intenta parsear JSON; si no, retorna el texto crudo
 */
export async function apiFetch(endpoint, options = {}) {
  const accessToken = getAccessToken();
  const method = options.method || 'GET';

  const doFetch = (token = accessToken) =>
    fetch(join(API_URL, endpoint), {
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(CSRF_TOKEN ? { "X-CSRFToken": CSRF_TOKEN } : {}),
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });

  let res;

  try {
    // Usar retry para GET requests
    if (RETRY_CONFIG.RETRYABLE_METHODS.includes(method.toUpperCase())) {
      res = await fetchWithRetry(() => doFetch(), method);
    } else {
      res = await doFetch();
    }
  } catch (networkError) {
    // Error de red sin respuesta
    logger.error('Network error:', networkError);
    return { ok: false, status: 0, data: null, networkError: true };
  }

  // Reintento automático si parece error de CSRF
  if (res.status === 403) {
    const text = await res.clone().text().catch(() => "");
    if (/csrf/i.test(text)) {
      await initCsrf();
      res = await doFetch();
    }
  }

  // Reintento automático si token expirado (401)
  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await doFetch(getAccessToken());
    }
  }

  const raw = await res.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  return { ok: res.ok, status: res.status, data };
}

/**
 * apiFetchForm
 * - Pensado para multipart/form-data (FormData).
 * - NO seteamos Content-Type (el navegador define el boundary).
 * - Reintenta si el CSRF rota (403) o token expirado (401).
 */
export async function apiFetchForm(endpoint, formData, options = {}) {
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const accessToken = getAccessToken();

  const doFetch = (token = accessToken) =>
    fetch(`${API_URL.replace(/\/+$/, "")}${url}`, {
      method: options.method || "POST",
      credentials: "include",
      headers: {
        ...(CSRF_TOKEN ? { "X-CSRFToken": CSRF_TOKEN } : {}),
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      body: formData,
      ...options,
    });

  let res = await doFetch();

  if (res.status === 403) {
    const text = await res.clone().text().catch(() => "");
    if (/csrf/i.test(text)) {
      await initCsrf();
      res = await doFetch();
    }
  }

  // Reintento automático si token expirado (401)
  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await doFetch(getAccessToken());
    }
  }

  const raw = await res.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }
  return { ok: res.ok, status: res.status, data };
}

/**
 * Compat: getCookie()
 * - Dejado por compatibilidad; ya no se usa porque el CSRF viene de /csrf/.
 */
export function getCookie() {
  return null;
}
