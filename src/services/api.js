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









// --- para GETs simples ---
export async function getSuppliers() {
  return await apiFetch(`/suppliers/`);
}

export async function getCategories() {
  return await apiFetch(`/categories/`);
}

export async function postCategory(name) {
  return await apiFetch(`/categories/`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

// --- helper para FormData (multipart) ---
// NO seteamos Content-Type para que el navegador ponga el boundary.
// Incluimos credenciales y X-CSRFToken automáticamente y reintentamos si el CSRF rota.
export async function apiFetchForm(endpoint, formData, options = {}) {
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const doFetch = () =>
    fetch(`${API_URL.replace(/\/+$/,"")}${url}`, {
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
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  return { ok: res.ok, status: res.status, data };
}

export async function postProduct(formData) {
  return await apiFetchForm(`/products/`, formData);
}



// Crear proveedor
export async function postSupplier(data) {
  return await apiFetch(`/suppliers/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}


// Crear usuario
export async function postUser(data) {
  return await apiFetch(`/users/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}


// Editar cliente (PATCH)
export async function patchCliente(id, data) {
  return await apiFetch(`/customers/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// PATCH producto (multipart)
export async function patchProduct(id, formData) {
  // usa el helper multipart que reintenta si el CSRF rota
  return await apiFetchForm(`/products/${id}/`, formData, { method: "PATCH" });
}

// Editar usuario (perfil) por id
export async function patchUser(id, data) {
  return await apiFetch(`/users/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Editar proveedor (PATCH)
export async function patchSupplier(id, data) {
  return await apiFetch(`/suppliers/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Cambiar contraseña
export async function changePassword(old_password, new_password) {
  return await apiFetch(`/change-password/`, {
    method: "POST",
    body: JSON.stringify({ old_password, new_password }),
  });
}



// Resumen del dashboard
export async function getDashboardSummary() {
  return await apiFetch(`/dashboard/summary/`);
}


// PATCH JSON para producto (soft delete u otros campos simples)
export async function patchProductJson(id, data) {
  return await apiFetch(`/products/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}


// Generar reporte (PDF) y devolver un Blob
export async function generateReport(payload) {
  // payload: { type, start_date, end_date }
  return await apiFetchBlob(`/reports/generate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}


export async function postResetPassword(payload) {
  return await apiFetch(`/reset-password/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
