// ============================================================
// services/api.js
// SDK de consumo del backend (fetch con manejo de CSRF + helpers)
// ============================================================

// ===================== 0) CONFIGURACIÓN BASE =====================
export const API_URL = process.env.REACT_APP_API_URL;

// (Opcional) Raíz del backend, por si necesitas enlaces absolutos a /media, etc.
export const API_ROOT = API_URL.replace(/\/api\/productos\/?$/, "");

// Guardamos el token CSRF que expone el backend en /csrf/
let CSRF_TOKEN = null;

// Utilidad para unir URL base + endpoint sin barras duplicadas
const join = (b, p) => b.replace(/\/+$/, "") + "/" + p.replace(/^\/+/, "");


// ===================== 1) CSRF & FETCH WRAPPERS =====================

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
async function apiFetch(endpoint, options = {}) {
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
 * apiFetchBlob
 * - Igual que apiFetch pero devuelve Blob (ej. PDF).
 */
async function apiFetchBlob(endpoint, options = {}) {
  const res = await fetch(join(API_URL, endpoint), {
    credentials: "include",
    headers: {
      ...(CSRF_TOKEN ? { "X-CSRFToken": CSRF_TOKEN } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return await res.blob();
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


// ===================== 2) AUTENTICACIÓN =====================

/**
 * loginUser
 * - Autenticación por email/password.
 * - Tras login exitoso, refresca CSRF porque Django lo rota al autenticarse.
 */
export async function loginUser(email, password) {
  const r = await apiFetch(`/login/`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (r.ok) await initCsrf();
  return r;
}

/** forgotPassword - Envía correo de recuperación */
export async function forgotPassword(email) {
  return await apiFetch(`/forgot-password/`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/** changePassword - Cambiar contraseña autenticado */
export async function changePassword(old_password, new_password) {
  return await apiFetch(`/change-password/`, {
    method: "POST",
    body: JSON.stringify({ old_password, new_password }),
  });
}

/** postResetPassword - Usado desde enlace de recuperación */
export async function postResetPassword(payload) {
  return await apiFetch(`/reset-password/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


// ===================== 3) DASHBOARD =====================

/** Resumen del dashboard */
export async function getDashboardSummary() {
  return await apiFetch(`/dashboard/summary/`);
}


// ===================== 4) MOVIMIENTOS =====================

/** Listar movimientos */
export async function getMovements() {
  return await apiFetch(`/movements/`);
}

/** Crear movimiento */
export async function postMovement(data) {
  return await apiFetch(`/movements/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}


// ===================== 5) PRODUCTOS =====================

/** Listar productos */
export async function getProducts() {
  return await apiFetch(`/products/`);
}

/** Crear producto (multipart) */
export async function postProduct(formData) {
  return await apiFetchForm(`/products/`, formData);
}

/** PATCH producto (multipart) */
export async function patchProduct(id, formData) {
  return await apiFetchForm(`/products/${id}/`, formData, { method: "PATCH" });
}

/** PATCH JSON producto (soft delete u otros campos simples) */
export async function patchProductJson(id, data) {
  return await apiFetch(`/products/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}


// ===================== 6) CATEGORÍAS =====================

/** Listar categorías */
export async function getCategories() {
  return await apiFetch(`/categories/`);
}

/** Crear categoría */
export async function postCategory(name) {
  return await apiFetch(`/categories/`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}


// ===================== 7) CLIENTES =====================

/** Listar clientes */
export async function getCustomers() {
  return await apiFetch(`/customers/`);
}

/** Crear cliente */
export async function postCustomer(data) {
  return await apiFetch(`/customers/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Editar cliente (PATCH) */
export async function patchCustomer(id, data) {
  return await apiFetch(`/customers/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}


// ===================== 8) PROVEEDORES =====================

/** Listar proveedores */
export async function getSuppliers() {
  return await apiFetch(`/suppliers/`);
}

/** Crear proveedor */
export async function postSupplier(data) {
  return await apiFetch(`/suppliers/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Editar proveedor (PATCH) */
export async function patchSupplier(id, data) {
  return await apiFetch(`/suppliers/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}


// ===================== 9) USUARIOS =====================

/** Listar usuarios */
export async function getUsers() {
  return await apiFetch(`/users/`);
}

/** Crear usuario */
export async function postUser(data) {
  return await apiFetch(`/users/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Editar usuario (perfil) por id */
export async function patchUser(id, data) {
  return await apiFetch(`/users/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}


// ===================== 10) COTIZACIONES =====================

/** Crear cotización */
export async function postQuotation(data) {
  return await apiFetch(`/quotations/create/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * getCotizacionPDF
 * - Devuelve { ok, url, type }
 *   type: "blob" si el backend responde application/pdf directamente
 *         "absolute" si el backend responde JSON con { url } a un PDF en /media
 */
export async function getQuotationPDF(cotizacionId) {
  const res = await fetch(`${API_URL}/quotations/pdf/${cotizacionId}/`, {
    method: "GET",
    credentials: "include",
  });

  const ct = (res.headers.get("Content-Type") || "").toLowerCase();

  // Caso 1: PDF directo
  if (ct.includes("application/pdf")) {
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    return { ok: true, url, type: "blob" };
  }

  // Caso 2: JSON { url: "/media/..." }
  const data = await res.json().catch(() => ({}));
  if (res.ok && data?.url) {
    const backendBase = API_URL.replace(/\/api\/productos\/?$/, "");
    return { ok: true, url: backendBase + data.url, type: "absolute" };
  }

  return { ok: false, error: `Respuesta inesperada (${res.status})`, data };
}


// ===================== 11) REPORTES =====================

/** Listar historial de reportes */
export async function getReports() {
  return await apiFetch(`/reports/`);
}

/** Generar reporte (alias 1) */
export async function postReport(data) {
  return await apiFetch(`/reports/generate/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Generar reporte (alias 2, mismo endpoint que arriba) */
export async function generateReport(payload) {
  return await apiFetch(`/reports/generate/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


// ===================== 12) ALERTAS =====================

/** Listar alertas */
export async function getAlerts() {
  return await apiFetch(`/alerts/`);
}

/** Descartar alerta */
export async function dismissAlert(alertId) {
  return await apiFetch(`/alerts/${alertId}/dismiss/`, { method: "PATCH" });
}

