// ============================================================
// services/api/auth.js
// Funciones de autenticación y gestión de contraseñas con JWT
// ============================================================

import { apiFetch, initCsrf, setTokens, clearTokens } from "./config";

/**
 * loginUser
 * - Autenticación por email/password.
 * - Guarda tokens JWT en localStorage.
 * - Refresca CSRF porque Django lo rota al autenticarse.
 */
export async function loginUser(email, password) {
  const r = await apiFetch(`/login/`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (r.ok && r.data?.tokens) {
    // Guardar tokens JWT
    setTokens(r.data.tokens.access, r.data.tokens.refresh);
  }

  if (r.ok) await initCsrf();
  return r;
}

/**
 * logoutUser
 * - Limpia tokens JWT y datos de usuario del localStorage.
 */
export function logoutUser() {
  clearTokens();
  localStorage.removeItem("user");
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
