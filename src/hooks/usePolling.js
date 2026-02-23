// src/hooks/usePolling.js
import { useState, useRef, useEffect, useCallback } from "react";

export const POLLING_TIMEOUT = "timeout";

/**
 * Hook reutilizable para polling de tareas asíncronas (Celery).
 *
 * @param {Function} checkStatusFn - Función que recibe taskId y retorna { ok, data: { state, download_url?, error? } }
 * @param {Object} options
 * @param {number} options.interval - Intervalo de polling en ms (default: 2000)
 * @param {number} options.maxAttempts - Máximo de intentos (default: 30)
 *
 * @returns {{ start, stop, isPolling, result, error }}
 *   - start(taskId): inicia el polling para un taskId
 *   - stop(): detiene el polling manualmente
 *   - isPolling: boolean
 *   - result: download_url o resultado del task (null si no terminó)
 *   - error: mensaje de error (null si no falló)
 */
export function usePolling(checkStatusFn, { interval = 2000, maxAttempts = 30 } = {}) {
  const [isPolling, setIsPolling] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const attemptsRef = useRef(0);

  // Track mount state (compatible with React 18 StrictMode remounts)
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (isMountedRef.current) {
      setIsPolling(false);
    }
  }, []);

  const start = useCallback((taskId) => {
    // Limpiar estado anterior
    stop();
    setResult(null);
    setError(null);
    setIsPolling(true);
    attemptsRef.current = 0;

    intervalRef.current = setInterval(async () => {
      if (!isMountedRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        return;
      }

      attemptsRef.current += 1;

      if (attemptsRef.current > maxAttempts) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        if (!isMountedRef.current) return;
        setIsPolling(false);
        setError(POLLING_TIMEOUT);
        return;
      }

      const statusRes = await checkStatusFn(taskId);
      if (!isMountedRef.current) return;

      if (statusRes.ok && statusRes.data) {
        const { state, download_url, error: taskError } = statusRes.data;

        if (state === "SUCCESS") {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsPolling(false);
          setResult(download_url);
        } else if (state === "FAILURE") {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsPolling(false);
          setError(taskError || "Error en la tarea.");
        }
      }
    }, interval);
  }, [checkStatusFn, interval, maxAttempts, stop]);

  return { start, stop, isPolling, result, error };
}
