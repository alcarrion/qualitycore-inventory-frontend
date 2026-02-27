// ============================================================
// services/api/config.ts
// Configuración base y utilidades de CSRF/fetch con JWT httpOnly cookies
// ============================================================

import { RETRY_CONFIG, TIMEOUTS } from '../../constants/config';
import { logger } from '../../utils/logger';
import { clearSession } from '../authService';
import type { ApiResponse, FetchOptions } from '../../types/api';

// ===================== CONFIGURACIÓN BASE =====================
export const API_URL = process.env.REACT_APP_API_URL as string;
export const API_ROOT = API_URL.replace(/\/api\/?$/, "");

let CSRF_TOKEN: string | null = null;
let _csrfPromise: Promise<void> | null = null;
let _refreshPromise: Promise<boolean> | null = null;

const join = (b: string, p: string): string =>
  b.replace(/\/+$/, "") + "/" + p.replace(/^\/+/, "");


// ===================== TOKEN REFRESH =====================

export function refreshAccessToken(): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const res = await fetch(join(API_URL, "/token/refresh/"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(CSRF_TOKEN ? { "X-CSRFToken": CSRF_TOKEN } : {}),
        },
      });
      return res.ok;
    } catch (e) {
      logger.error("refreshAccessToken failed", e);
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}


// ===================== RETRY LOGIC =====================

const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

function isRetryableError(error: unknown, status: number | null, method: string): boolean {
  if (!RETRY_CONFIG.RETRYABLE_METHODS.includes(method.toUpperCase())) {
    return false;
  }
  if (error && !status) return true;
  if (status === 429) return true;
  if (status && (RETRY_CONFIG.RETRYABLE_STATUS_CODES as number[]).includes(status)) return true;
  return false;
}

function getRetryAfterMs(response: Response): number | null {
  const header = response?.headers?.get('Retry-After');
  if (!header) return null;
  const seconds = Number(header);
  if (!isNaN(seconds)) return seconds * 1000;
  const date = new Date(header);
  if (!isNaN(date.getTime())) return Math.max(0, date.getTime() - Date.now());
  return null;
}

async function fetchWithRetry(
  fetchFn: () => Promise<Response>,
  method: string = 'GET',
  maxRetries: number = RETRY_CONFIG.MAX_RETRIES
): Promise<Response> {
  let lastError: unknown;
  let lastStatus: number | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetchFn();

      if (res.ok || !isRetryableError(null, res.status, method)) {
        return res;
      }

      lastStatus = res.status;

      if (attempt === maxRetries) return res;

      const retryAfter = res.status === 429 ? getRetryAfterMs(res) : null;
      const waitMs = retryAfter ?? (RETRY_CONFIG.RETRY_DELAY * Math.pow(2, attempt));
      await delay(waitMs);

    } catch (error) {
      if ((error as Error).name === 'AbortError') throw error;

      lastError = error;

      if (attempt < maxRetries && isRetryableError(error, null, method)) {
        await delay(RETRY_CONFIG.RETRY_DELAY * Math.pow(2, attempt));
        continue;
      }

      throw error;
    }
  }

  if (lastError) throw lastError;
  throw new Error(`Request failed with status ${lastStatus}`);
}


// ===================== CSRF & FETCH WRAPPERS =====================

export function initCsrf(): Promise<void> {
  if (_csrfPromise) return _csrfPromise;

  _csrfPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/csrf/`, { credentials: "include" });
      if (!res.ok) {
        logger.error(`initCsrf: HTTP ${res.status} ${res.statusText}`);
        return;
      }
      const data = await res.json().catch((err: unknown) => {
        logger.error("initCsrf: JSON parse failed", err);
        return {};
      }) as { csrfToken?: string };
      if (data?.csrfToken) CSRF_TOKEN = data.csrfToken;
    } catch (e) {
      logger.error("initCsrf failed", e);
    } finally {
      _csrfPromise = null;
    }
  })();

  return _csrfPromise;
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const method = options.method ?? 'GET';
  const { signal } = options;
  const timeout = options.timeout ?? TIMEOUTS.API_TIMEOUT;

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout);
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  const doFetch = (): Promise<Response> =>
    fetch(join(API_URL, endpoint), {
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(CSRF_TOKEN ? { "X-CSRFToken": CSRF_TOKEN } : {}),
        ...(options.headers as Record<string, string> || {}),
      },
      ...options,
      signal: combinedSignal,
    });

  let res: Response;

  try {
    if ((RETRY_CONFIG.RETRYABLE_METHODS as string[]).includes(method.toUpperCase())) {
      res = await fetchWithRetry(() => doFetch(), method);
    } else {
      res = await doFetch();
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      return { ok: false, status: 0, data: null, aborted: true };
    }
    logger.error('Network error:', error);
    return { ok: false, status: 0, data: null, networkError: true };
  }

  if (res.status === 403) {
    const text = await res.clone().text().catch(() => "");
    if (/csrf/i.test(text)) {
      await initCsrf();
      res = await doFetch();
    }
  }

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await doFetch();
    } else {
      clearSession();
      window.location.href = "/";
      return { ok: false, status: 401, data: null };
    }
  }

  clearTimeout(timeoutId);

  const raw = await res.text();
  let data: T | null;
  try {
    data = raw ? (JSON.parse(raw) as T) : null;
  } catch {
    data = raw as unknown as T;
  }

  return { ok: res.ok, status: res.status, data };
}

export async function apiFetchForm<T = unknown>(
  endpoint: string,
  formData: FormData,
  options: Omit<FetchOptions, 'body'> = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const { signal } = options;
  const timeout = options.timeout ?? TIMEOUTS.API_TIMEOUT;

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout);
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  const doFetch = (): Promise<Response> =>
    fetch(`${API_URL.replace(/\/+$/, "")}${url}`, {
      method: options.method ?? "POST",
      credentials: "include",
      headers: {
        ...(CSRF_TOKEN ? { "X-CSRFToken": CSRF_TOKEN } : {}),
        ...(options.headers as Record<string, string> || {}),
      },
      body: formData,
      ...options,
      signal: combinedSignal,
    });

  let res: Response;
  try {
    res = await doFetch();
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      return { ok: false, status: 0, data: null, aborted: true };
    }
    throw error;
  }

  if (res.status === 403) {
    const text = await res.clone().text().catch(() => "");
    if (/csrf/i.test(text)) {
      await initCsrf();
      res = await doFetch();
    }
  }

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await doFetch();
    } else {
      clearSession();
      window.location.href = "/";
      return { ok: false, status: 401, data: null };
    }
  }

  clearTimeout(timeoutId);

  const raw = await res.text();
  let data: T | null;
  try {
    data = raw ? (JSON.parse(raw) as T) : null;
  } catch {
    data = raw as unknown as T;
  }
  return { ok: res.ok, status: res.status, data };
}
