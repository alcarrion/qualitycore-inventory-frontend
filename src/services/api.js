// src/services/api.js
export const API_URL = process.env.REACT_APP_API_URL;

// Función para obtener el CSRF token de las cookies
export function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Función genérica para peticiones API (maneja CSRF y errores)
async function apiFetch(endpoint, options = {}) {
  const csrftoken = getCookie("csrftoken");
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(csrftoken ? { "X-CSRFToken": csrftoken } : {}),
      ...(options.headers || {})
    },
    ...options,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = text;
  }

  return { ok: res.ok, ...data };
}

// Función para peticiones que devuelven PDF/Blob
async function apiFetchBlob(endpoint, options = {}) {
  const csrftoken = getCookie("csrftoken");
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      ...(csrftoken ? { "X-CSRFToken": csrftoken } : {}),
      ...(options.headers || {})
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }
  return await res.blob();
}

// ✅ Login
export async function loginUser(email, password) {
  const result = await apiFetch(`/login/`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (result.ok && result.user) {
    localStorage.setItem("user", JSON.stringify(result.user));
  }
  return result;
}

// ✅ Recuperación de contraseña
export async function forgotPassword(email) {
  return await apiFetch(`/forgot-password/`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ✅ Obtener lista de movimientos
export async function getMovimientos() {
  return await apiFetch(`/movements/`);
}

// ✅ Crear nuevo movimiento
export async function postMovimiento(data) {
  return await apiFetch(`/movements/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ✅ Obtener lista de productos
export async function getProductos() {
  return await apiFetch(`/products/`);
}

// ✅ Obtener lista de clientes
export async function getClientes() {
  return await apiFetch(`/customers/`);
}

// ✅ Crear nueva cotización
export async function postCotizacion(data) {
  return await apiFetch(`/quotations/create/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ✅ Generar PDF de una cotización por ID
export async function getCotizacionPDF(cotizacionId) {
  const blob = await apiFetchBlob(`/quotations/pdf/${cotizacionId}/`, { method: "GET" });
  const url = window.URL.createObjectURL(blob);
  return { ok: true, url };
}

// ✅ Obtener reportes generados
export async function getReportes() {
  return await apiFetch(`/reports/`);
}

// ✅ Generar nuevo reporte PDF (por tipo y fechas)
export async function postReporte(data) {
  return await apiFetch(`/reports/generate/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ✅ Obtener alertas
export async function getAlertas() {
  return await apiFetch(`/alerts/`);
}

// ✅ Marcar alerta como resuelta
export async function dismissAlerta(alertId) {
  return await apiFetch(`/alerts/${alertId}/dismiss/`, {
    method: "PATCH",
  });
}

























export async function initCsrf() {
  try {
    // llama a /api/productos/csrf/ (API_URL ya incluye /api/productos)
    await fetch(`${API_URL}/csrf/`, { credentials: "include" });
  } catch (e) {
    console.error("initCsrf failed", e);
  }
}