// ============================================================
// services/authService.ts
// Servicio centralizado para manejo de datos de usuario en localStorage.
// ============================================================

import type { User } from '../types/models';

const USER_KEY = 'user';

/**
 * Obtiene el usuario actual de localStorage.
 */
export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

/**
 * Guarda el usuario en localStorage y notifica a otros componentes.
 */
export function setStoredUser(user: User): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('userUpdated'));
  } catch {
    // localStorage puede fallar en modo privado o sin espacio
  }
}

/**
 * Actualiza parcialmente el usuario guardado (merge con datos existentes).
 */
export function updateStoredUser(updates: Partial<User>): User | null {
  const current = getStoredUser();
  if (!current) return null;
  const updated: User = { ...current, ...updates };
  setStoredUser(updated);
  return updated;
}

/**
 * Limpia datos de sesión del localStorage.
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // localStorage puede fallar en modo privado o sin espacio
  }
}

/**
 * Limpia sesión y redirige al login.
 */
export function logout(): void {
  clearSession();
  window.location.href = '/';
}
