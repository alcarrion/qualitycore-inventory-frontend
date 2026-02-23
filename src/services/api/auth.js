// ============================================================
// services/api/auth.js
// Funciones de autenticación y gestión de contraseñas con JWT httpOnly cookies
// ============================================================

import { apiFetch, initCsrf } from "./config";
import { clearSession } from "../authService";

/**
 * loginUser
 * - Autenticación por email/password.
 * - Los tokens JWT se setean como cookies httpOnly por el backend.
 * - Refresca CSRF porque Django lo rota al autenticarse.
 */
export async function loginUser(email, password) {
  const r = await apiFetch(`/login/`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // Tokens se reciben como cookies httpOnly (no hay que guardarlos)
  if (r.ok) await initCsrf();
  return r;
}

/**
 * logoutUser
 * - Llama al backend para borrar cookies httpOnly.
 * - Limpia datos de usuario del localStorage.
 */
export async function logoutUser() {
  try {
    await apiFetch(`/logout/`, { method: "POST" });
  } catch {
    // Aunque falle la petición, limpiar estado local
  }
  clearSession();
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
