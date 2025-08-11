// src/services/api.js
export const API_URL = process.env.REACT_APP_API_URL;

// Guardamos aquí el token CSRF que devuelve el backend en /csrf/
let CSRF_TOKEN = null;

export async function initCsrf() {
  try {
    const res = await fetch(`${API_URL}/csrf/`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (data?.csrfToken) CSRF_TOKEN = data.csrfToken;
  } catch (e) {
    console.error("initCsrf failed", e);
  }
}

const join = (b, p) => b.replace(/\/+$/, "") + "/" + p.replace(/^\/+/, "");

// 👇 apiFetch ahora reintenta 1 vez si el 403 es por CSRF
async function apiFetch(endpoint, options = {}) {
  const doFetch = () =>
    fetch(join(API_URL, endpoint), {
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(CSRF_TOKEN ? { "X-CSRFToken": CSRF_TOKEN } : {}), // usa header canonical
        ...(options.headers || {}),
      },
      ...options,
    });

  let res = await doFetch();

  if (res.status === 403) {
    const text = await res.clone().text().catch(() => "");
    if (/csrf/i.test(text)) {
      await initCsrf();      // refresca token
      res = await doFetch(); // reintenta una vez
    }
  }

  const raw = await res.text();
  let data;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  return { ok: res.ok, status: res.status, data };
}

// --- Wrapper para Blob/PDF ---
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

// ================== ENDPOINTS ==================

// ✅ Login
// ✅ tras login exitoso, refresca el CSRF (Django lo rota al autenticarse)
export async function loginUser(email, password) {
  const r = await apiFetch(`/login/`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (r.ok) await initCsrf();
  return r;
}

// ✅ Recuperación de contraseña
export async function forgotPassword(email) {
  return await apiFetch(`/forgot-password/`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ✅ Movimientos
export async function getMovimientos() {
  return await apiFetch(`/movements/`);
}
export async function postMovimiento(data) {
  return await apiFetch(`/movements/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ✅ Productos
export async function getProductos() {
  return await apiFetch(`/products/`);
}

// ✅ Clientes
export async function getClientes() {
  return await apiFetch(`/customers/`);
}

// ✅ Cotizaciones
export async function postCotizacion(data) {
  return await apiFetch(`/quotations/create/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function getCotizacionPDF(cotizacionId) {
  const blob = await apiFetchBlob(`/quotations/pdf/${cotizacionId}/`, { method: "GET" });
  const url = window.URL.createObjectURL(blob);
  return { ok: true, url };
}

// ✅ Reportes
export async function getReportes() {
  return await apiFetch(`/reports/`);
}
export async function postReporte(data) {
  return await apiFetch(`/reports/generate/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ✅ Alertas
export async function getAlertas() {
  return await apiFetch(`/alerts/`);
}
export async function dismissAlerta(alertId) {
  return await apiFetch(`/alerts/${alertId}/dismiss/`, { method: "PATCH" });
}



// Parche temporal: evita errores de import
export function getCookie() {
  return null; // ya no se usa; el CSRF viene de initCsrf()
}



// crea cliente
export async function postCliente(data) {
  return await apiFetch(`/customers/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}