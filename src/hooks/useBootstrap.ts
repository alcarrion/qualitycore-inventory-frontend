// hooks/useBootstrap.ts
// Coordina la carga inicial de datos de los stores al arrancar la app.
// Products y customers NO se cargan en startup — se buscan lazy via
// useProductSearch / useCustomerSearch cuando el usuario abre un dropdown.
import { useState, useCallback } from 'react';
import { useAppConfigStore } from '../store/appConfigStore';
import { useMasterDataStore } from '../store/masterDataStore';
import { useShallow } from 'zustand/react/shallow';

let fetchAllCounter = 0;

export function useBootstrap() {
  const [loading, setLoading] = useState(false);
  const configError = useAppConfigStore(useShallow((s) => s.configError));

  // Las acciones de Zustand son referencias estables — no cambian entre renders.
  // Leerlas con getState() evita suscripciones innecesarias al store y evita
  // que fetchAll sea recreado en cada render por cambios de referencia.
  const fetchAll = useCallback(async (signal?: AbortSignal): Promise<void> => {
    const thisCall = ++fetchAllCounter;
    setLoading(true);
    try {
      await useAppConfigStore.getState().fetchAppConfig(signal);
      if (thisCall !== fetchAllCounter) return;

      await Promise.all([
        useMasterDataStore.getState().fetchSuppliers(signal),
        useMasterDataStore.getState().fetchCategories(signal),
        useMasterDataStore.getState().fetchAlerts(signal),
        useMasterDataStore.getState().fetchDashboard(signal),
      ]);
    } finally {
      if (thisCall === fetchAllCounter) setLoading(false);
    }
  }, []); // Sin deps: getState() siempre lee la versión actual de las acciones

  return { loading, fetchAll, configError };
}
