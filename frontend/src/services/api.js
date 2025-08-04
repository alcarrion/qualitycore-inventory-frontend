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

// ✅ Login
export async function loginUser(email, password) {
  const csrftoken = getCookie("csrftoken");
  try {
    const res = await fetch(`${API_URL}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return { ok: res.ok, ...data };
  } catch {
    return { ok: false, message: "Error de conexión con el servidor" };
  }
}

// ✅ Recuperación de contraseña
export async function forgotPassword(email) {
  try {
    const res = await fetch(`${API_URL}/forgot-password/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return { ok: res.ok, ...data };
  } catch {
    return { ok: false, message: "Error de conexión con el servidor" };
  }
}

// ✅ Obtener lista de movimientos
export async function getMovimientos() {
  const res = await fetch(`${API_URL}/movements/`, {
    credentials: "include",
  });
  return await res.json();
}

// ✅ Crear nuevo movimiento
export async function postMovimiento(data) {
  const csrftoken = getCookie("csrftoken");
  const res = await fetch(`${API_URL}/movements/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res;
}

// ✅ Obtener lista de productos
export async function getProductos() {
  const res = await fetch(`${API_URL}/products/`, {
    credentials: "include",
  });
  return await res.json();
}

// ✅ Obtener lista de clientes
export async function getClientes() {
  const res = await fetch(`${API_URL}/customers/`, {
    credentials: "include",
  });
  return await res.json();
}

// ✅ Crear nueva cotización (ruta corregida)
export async function postCotizacion(data) {
  const csrftoken = getCookie("csrftoken");
  const res = await fetch(`${API_URL}/quotations/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const result = await res.json();
  return { ok: res.ok, ...result };
}

// ✅ Generar PDF de una cotización por ID
export async function getCotizacionPDF(cotizacionId) {
  const res = await fetch(`${API_URL}/quotations/pdf/${cotizacionId}/`, {
    method: "GET",
    credentials: "include",
  });
  const result = await res.json();
  return { ok: res.ok, ...result };
}

// ✅ Obtener reportes generados
export async function getReportes() {
  const res = await fetch(`${API_URL}/reports/`, {
    credentials: "include",
  });
  return await res.json();
}

// ✅ Generar nuevo reporte PDF (por tipo y fechas)
export async function postReporte(data) {
  const csrftoken = getCookie("csrftoken");
  const res = await fetch(`${API_URL}/reports/generate/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const result = await res.json();
  return { ok: res.ok, ...result };
}

// ✅ Obtener alertas
export async function getAlertas() {
  const res = await fetch(`${API_URL}/alerts/`, {
    credentials: "include",
  });
  return await res.json();
}

// ✅ Marcar alerta como resuelta
export async function dismissAlerta(alertId) {
  const csrftoken = getCookie("csrftoken");
  const res = await fetch(`${API_URL}/alerts/${alertId}/dismiss/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    credentials: "include",
  });
  const result = await res.json();
  return { ok: res.ok, ...result };
}
