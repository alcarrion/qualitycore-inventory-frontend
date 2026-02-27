// hooks/useAbortSignal.ts
import { useEffect, useRef } from 'react';

/**
 * Hook que crea un AbortController y lo cancela automáticamente
 * cuando el componente se desmonta.
 *
 * Uso:
 *   const getSignal = useAbortSignal();
 *
 *   useEffect(() => {
 *     fetchData({ signal: getSignal() });
 *   }, []);
 *
 * Cada llamada a getSignal() crea un nuevo AbortController.
 * Todos se cancelan automáticamente al desmontar el componente.
 */
export function useAbortSignal(): () => AbortSignal {
  const controllersRef = useRef<AbortController[]>([]);

  useEffect(() => {
    return () => {
      // Al desmontar, cancelar todos los controllers activos
      controllersRef.current.forEach(c => c.abort());
      controllersRef.current = [];
    };
  }, []);

  const getSignal = (): AbortSignal => {
    const controller = new AbortController();
    controllersRef.current.push(controller);
    return controller.signal;
  };

  return getSignal;
}
