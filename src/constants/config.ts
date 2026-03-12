// ============================================================
// constants/config.ts
// Configuración y valores constantes de la aplicación
// ============================================================

/**
 * Timeouts (en milisegundos)
 */
export const TIMEOUTS = {
  // Toast/Notificaciones
  TOAST_DEFAULT: 5000,
  TOAST_SHORT: 3000,
  TOAST_LONG: 8000,

  // Mensajes temporales en UI
  MESSAGE_DISPLAY: 4000,

  // Redirecciones
  REDIRECT_DELAY: 2000,

  // Polling
  POLLING_INTERVAL: 2000,

  // Reloj en tiempo real
  CLOCK_INTERVAL: 1000,

  // API
  API_TIMEOUT: 30000,
  RETRY_DELAY: 1000,
} as const;

/**
 * Configuración de reintentos de API
 */
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: TIMEOUTS.RETRY_DELAY,
  // Solo errores de servidor (nunca reintentar 4xx del cliente)
  RETRYABLE_STATUS_CODES: [500, 502, 503, 504] as number[],
  // No reintentar métodos que modifican datos
  RETRYABLE_METHODS: ['GET', 'HEAD', 'OPTIONS'] as string[],
} as const;

/**
 * Configuración de imágenes
 */
const _IMAGE_MAX_SIZE_MB = 2;
export const IMAGE_CONFIG = {
  MAX_SIZE_MB: _IMAGE_MAX_SIZE_MB,
  MAX_SIZE_BYTES: _IMAGE_MAX_SIZE_MB * 1024 * 1024, // fuente única: derivado de MAX_SIZE_MB
  MIN_WIDTH: 300,
  MIN_HEIGHT: 300,
  MAX_WIDTH: 2000,
  MAX_HEIGHT: 2000,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as string[],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'] as string[],
} as const;

/**
 * Configuración de paginación
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as number[],
} as const;

/**
 * Configuración de validación
 */
export const VALIDATION = {
  PHONE_LENGTH: 10,
  PASSWORD_MIN_LENGTH: 8,
} as const;
