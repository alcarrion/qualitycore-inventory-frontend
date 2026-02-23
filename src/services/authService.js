// ============================================================
// services/authService.js
// Servicio centralizado para manejo de datos de usuario en localStorage.
// Elimina la dispersión de localStorage.getItem/setItem("user") por toda la app.
//
// CONVENCIÓN DE ESTADO:
//   - localStorage es la fuente de verdad para datos del usuario
//   - App.js mantiene un useState(user) sincronizado via evento "userUpdated"
//   - Las páginas acceden a user via useOutletContext() (pasado desde Layout)
//   - Zustand (dataStore) maneja datos de negocio (productos, clientes, etc.)
//   - AppContext maneja estado de UI (toasts, loading, dark mode)
//   - NUNCA guardar user en Zustand o AppContext — solo aquí + App.js useState
// ============================================================

const USER_KEY = 'user';

/**
 * Obtiene el usuario actual de localStorage.
 * @returns {object|null} Usuario parseado o null
 */
export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
}

/**
 * Guarda el usuario en localStorage y notifica a otros componentes.
 * @param {object} user - Datos del usuario
 */
export function setStoredUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('userUpdated'));
  } catch {
    // localStorage puede fallar en modo privado o sin espacio
  }
}

/**
 * Actualiza parcialmente el usuario guardado (merge con datos existentes).
 * @param {object} updates - Campos a actualizar
 * @returns {object|null} Usuario actualizado
 */
export function updateStoredUser(updates) {
  const current = getStoredUser();
  if (!current) return null;
  const updated = { ...current, ...updates };
  setStoredUser(updated);
  return updated;
}

/**
 * Limpia datos de sesión del localStorage.
 * Los tokens JWT son cookies httpOnly que el backend borra en /logout/.
 */
export function clearSession() {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // localStorage puede fallar en modo privado o sin espacio
  }
}

/**
 * Limpia sesión y redirige al login.
 */
export function logout() {
  clearSession();
  window.location.href = '/';
}
