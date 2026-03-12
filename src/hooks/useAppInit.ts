// src/hooks/useAppInit.ts
/**
 * Gestiona el ciclo de vida de la sesión de la aplicación:
 * - Usuario optimista desde localStorage
 * - Validación de sesión contra el servidor (getMe)
 * - Sincronización entre pestañas (storage / userUpdated events)
 * - Logout
 *
 * Extraído de AppContent para aislar los 3 concerns de inicialización
 * y mantener App.tsx centrado en routing y UI.
 */
import { useState, useEffect } from 'react';
import { getStoredUser, clearSession } from '../services/authService';
import { logoutUser } from '../services/api/auth';
import { getMe } from '../services/api';
import type { User } from '../types/models';

export function useAppInit() {
  // Valor optimista: evita el flash de la pantalla de login para usuarios autenticados
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  // Gate para fetchAll: solo true después de que getMe() resuelve,
  // evitando el doble-bootstrap cuando setUser(serverData) cambia la referencia.
  const [sessionValidated, setSessionValidated] = useState(false);

  // Validar sesión contra el servidor al montar
  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      setSessionValidated(true); // no hay sesión que validar
      return;
    }
    getMe().then((res) => {
      if (res.ok && res.data) {
        setUser(res.data as User); // refrescar con datos actuales del servidor
      } else if (!res.aborted && (res.status === 401 || res.status === 403)) {
        clearSession();
        setUser(null);
      }
      // React 18 batea setUser + setSessionValidated → un solo render
      setSessionValidated(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Intencional: valida el JWT exactamente una vez al montar. getMe es una
    // función estable de servicios; incluirla en deps no aporta nada y causaría
    // validaciones repetidas si la referencia cambiara.
  }, []);

  // Sincronizar usuario con otros contextos: cross-tab (storage) y same-tab (userUpdated)
  useEffect(() => {
    const handleStorageChange = () => setUser(getStoredUser());
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    window.location.href = '/';
  };

  return { user, setUser, sessionValidated, handleLogout };
}
