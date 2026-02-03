// ============================================================
// services/api/config.js
// Configuración base y utilidades de CSRF/fetch
// ============================================================

// ===================== CONFIGURACIÓN BASE =====================
export const API_URL = process.env.REACT_APP_API_URL;

// (Opcional) Raíz del backend, por si necesitas enlaces absolutos a /media, etc.
export const API_ROOT = API_URL.replace(/\/api\/products\/?$/, "");

// Guardamos el token CSRF que expone el backend en /csrf/
let CSRF_TOKEN = null;

// Utilidad para unir URL base + endpoint sin barras duplicadas
const join = (b, p) => b.replace(/\/+$/, "") + "/" + p.replace(/^\/+/, "");


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
    console.error("initCsrf failed", e);
  }
}

/**
 * apiFetch
 * - Envoltorio de fetch que:
 *   a) incluye credenciales (cookies) automáticamente
 *   b) agrega X-CSRFToken si existe
 *   c) reintenta 1 vez si recibe 403 por CSRF rotado
 *   d) intenta parsear JSON; si no, retorna el texto crudo
 */
export async function apiFetch(endpoint, options = {}) {
  const doFetch = () =>
    fetch(join(API_URL, endpoint), {
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(CSRF_TOKEN ? { "X-CSRFToken": CSRF_TOKEN } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });

  let res = await doFetch();

  // Reintento automático si parece error de CSRF
  if (res.status === 403) {
    const text = await res.clone().text().catch(() => "");
    if (/csrf/i.test(text)) {
      await initCsrf();
      res = await doFetch();
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
 * - Reintenta si el CSRF rota (403).
 */
export async function apiFetchForm(endpoint, formData, options = {}) {
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
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
    });

  let res = await doFetch();

  if (res.status === 403) {
    const text = await res.clone().text().catch(() => "");
    if (/csrf/i.test(text)) {
      await initCsrf();
      res = await doFetch();
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
