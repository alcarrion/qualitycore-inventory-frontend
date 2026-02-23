// ============================================================
// services/api/config.js
// Configuración base y utilidades de CSRF/fetch con JWT httpOnly cookies
// ============================================================

import { RETRY_CONFIG, TIMEOUTS } from '../../constants/config';
import { logger } from '../../utils/logger';
import { clearSession } from '../authService';

// ===================== CONFIGURACIÓN BASE =====================
export const API_URL = process.env.REACT_APP_API_URL;

// (Opcional) Raíz del backend, por si necesitas enlaces absolutos a /media, etc.
export const API_ROOT = API_URL.replace(/\/api\/?$/, "");

// Guardamos el token CSRF que expone el backend en /csrf/
let CSRF_TOKEN = null;

// Mutex: si ya hay una renovación en curso, reutilizar esa promise
let _csrfPromise = null;
let _refreshPromise = null;

// Utilidad para unir URL base + endpoint sin barras duplicadas
const join = (b, p) => b.replace(/\/+$/, "") + "/" + p.replace(/^\/+/, "");


// ===================== TOKEN REFRESH =====================

/**
 * refreshAccessToken - Pide al backend renovar el access token.
 * El refresh token se envía automáticamente como cookie httpOnly.
 * Retorna true si tuvo éxito, false si no (sesión expirada).
 */
export function refreshAccessToken() {
  // Si ya hay un refresh en curso, reutilizar la misma promise
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const res = await fetch(join(API_URL, "/token/refresh/"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(CSRF_TOKEN ? { "X-CSRFToken": CSRF_TOKEN } : {}),
        },
      });
      return res.ok;
    } catch (e) {
      logger.error("refreshAccessToken failed", e);
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
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

  // 429 Too Many Requests — se maneja con Retry-After
  if (status === 429) {
    return true;
  }

  // Solo errores de servidor (500, 502, 503, 504)
  if (status && RETRY_CONFIG.RETRYABLE_STATUS_CODES.includes(status)) {
    return true;
  }

  return false;
}

/**
 * Extrae el delay del header Retry-After (en ms).
 * Soporta segundos ("30") o fecha HTTP ("Sun, 23 Feb 2026 00:00:00 GMT").
 */
function getRetryAfterMs(response) {
  const header = response?.headers?.get('Retry-After');
  if (!header) return null;

  const seconds = Number(header);
  if (!isNaN(seconds)) return seconds * 1000;

  const date = new Date(header);
  if (!isNaN(date.getTime())) return Math.max(0, date.getTime() - Date.now());

  return null;
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

      // Para 429, usar Retry-After del servidor si está disponible
      const retryAfter = res.status === 429 ? getRetryAfterMs(res) : null;
      const waitMs = retryAfter || (RETRY_CONFIG.RETRY_DELAY * Math.pow(2, attempt));
      await delay(waitMs);

    } catch (error) {
      // Si fue cancelado por AbortController, no reintentar
      if (error.name === 'AbortError') throw error;

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
export function initCsrf() {
  // Si ya hay una renovación en curso, reutilizar la misma promise
  if (_csrfPromise) return _csrfPromise;

  _csrfPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/csrf/`, { credentials: "include" });
      if (!res.ok) {
        logger.error(`initCsrf: HTTP ${res.status} ${res.statusText}`);
        return;
      }
      const data = await res.json().catch((err) => {
        logger.error("initCsrf: JSON parse failed", err);
        return {};
      });
      if (data?.csrfToken) CSRF_TOKEN = data.csrfToken;
    } catch (e) {
      logger.error("initCsrf failed", e);
    } finally {
      _csrfPromise = null;
    }
  })();

  return _csrfPromise;
}

/**
 * apiFetch
 * - Envoltorio de fetch que:
 *   a) incluye credenciales (cookies) automáticamente
 *   b) agrega X-CSRFToken si existe
 *   c) JWT access token se envía como cookie httpOnly (automático por el browser)
 *   d) reintenta automáticamente en errores de red (GET solamente)
 *   e) reintenta 1 vez si recibe 403 por CSRF rotado
 *   f) reintenta 1 vez si recibe 401 (refresh via cookie)
 *   g) intenta parsear JSON; si no, retorna el texto crudo
 */
export async function apiFetch(endpoint, options = {}) {
  const method = options.method || 'GET';
  const { signal } = options;
  const timeout = options.timeout ?? TIMEOUTS.API_TIMEOUT;

  // Combinar signal del caller con timeout
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout);
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  const doFetch = () =>
    fetch(join(API_URL, endpoint), {
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(CSRF_TOKEN ? { "X-CSRFToken": CSRF_TOKEN } : {}),
        ...(options.headers || {}),
      },
      ...options,
      signal: combinedSignal,
    });

  let res;

  try {
    // Usar retry para GET requests
    if (RETRY_CONFIG.RETRYABLE_METHODS.includes(method.toUpperCase())) {
      res = await fetchWithRetry(() => doFetch(), method);
    } else {
      res = await doFetch();
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { ok: false, status: 0, data: null, aborted: true };
    }
    logger.error('Network error:', error);
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
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await doFetch();
    } else {
      // Refresh token expirado - redirigir al login
      clearSession();
      window.location.href = "/";
      return { ok: false, status: 401, data: null };
    }
  }

  clearTimeout(timeoutId);

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
  const { signal } = options;
  const timeout = options.timeout ?? TIMEOUTS.API_TIMEOUT;

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout);
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  const doFetch = () =>
    fetch(`${API_URL.replace(/\/+$/, "")}${url}`, {
      method: options.method || "POST",
      credentials: "include",
      headers: {
        ...(CSRF_TOKEN ? { "X-CSRFToken": CSRF_TOKEN } : {}),
        ...(options.headers || {}),
      },
      body: formData,
      ...options,
      signal: combinedSignal,
    });

  let res;
  try {
    res = await doFetch();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { ok: false, status: 0, data: null, aborted: true };
    }
    throw error;
  }

  if (res.status === 403) {
    const text = await res.clone().text().catch(() => "");
    if (/csrf/i.test(text)) {
      await initCsrf();
      res = await doFetch();
    }
  }

  // Reintento automático si token expirado (401)
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await doFetch();
    } else {
      // Refresh token expirado - redirigir al login
      clearSession();
      window.location.href = "/";
      return { ok: false, status: 401, data: null };
    }
  }

  clearTimeout(timeoutId);

  const raw = await res.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }
  return { ok: res.ok, status: res.status, data };
}
