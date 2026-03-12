// src/hooks/usePolling.ts
import { useState, useRef, useEffect, useCallback } from "react";
import type { ApiResponse } from "../types/api";

export const POLLING_TIMEOUT = "timeout";

interface PollingStatusData {
  state: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE';
  download_url?: string;
  error?: string;
}

/**
 * Hook reutilizable para polling de tareas asíncronas (Celery).
 *
 * @param checkStatusFn - Función que recibe taskId y retorna { ok, data: { state, download_url?, error? } }
 * @param options
 * @param options.interval - Intervalo de polling en ms (default: 2000)
 * @param options.maxAttempts - Máximo de intentos (default: 30)
 *
 * @returns {{ start, stop, isPolling, result, error }}
 *   - start(taskId): inicia el polling para un taskId
 *   - stop(): detiene el polling manualmente
 *   - isPolling: boolean
 *   - result: download_url o resultado del task (null si no terminó)
 *   - error: mensaje de error (null si no falló)
 */
export function usePolling(
  checkStatusFn: (taskId: string) => Promise<ApiResponse<PollingStatusData>>,
  { interval = 2000, maxAttempts = 30 }: { interval?: number; maxAttempts?: number } = {}
) {
  const [isPolling, setIsPolling] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);
  const attemptsRef = useRef(0);
  const startTimeRef = useRef<number>(0);

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

  const start = useCallback((taskId: string) => {
    // Limpiar estado anterior
    stop();
    setResult(null);
    setError(null);
    setElapsedSeconds(0);
    setIsPolling(true);
    attemptsRef.current = 0;
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(async () => {
      if (!isMountedRef.current) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        return;
      }

      attemptsRef.current += 1;
      if (isMountedRef.current) {
        setElapsedSeconds(Math.round((Date.now() - startTimeRef.current) / 1000));
      }

      if (attemptsRef.current > maxAttempts) {
        clearInterval(intervalRef.current!);
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
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsPolling(false);
          setResult(download_url ?? null);
        } else if (state === "FAILURE") {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsPolling(false);
          setError(taskError ?? "Error en la tarea.");
        }
      }
    }, interval);
  }, [checkStatusFn, interval, maxAttempts, stop]);

  return { start, stop, isPolling, result, error, elapsedSeconds };
}
