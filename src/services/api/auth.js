// ============================================================
// services/api/auth.js
// Funciones de autenticación y gestión de contraseñas
// ============================================================

import { apiFetch, initCsrf } from "./config";

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
