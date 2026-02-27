// ============================================================
// utils/logger.ts
// Logger condicional para evitar logs en producción
// ============================================================

const isDev = process.env.NODE_ENV === 'development';

/**
 * Logger que solo muestra logs en desarrollo.
 * Los errores siempre se muestran para monitoreo.
 *
 * Uso:
 *   import { logger } from '../utils/logger';
 *   logger.log('Debug info');     // Solo en desarrollo
 *   logger.warn('Advertencia');   // Solo en desarrollo
 *   logger.error('Error:', err);  // Siempre (para monitoreo)
 */
export const logger = {
  /**
   * Log de debug - Solo en desarrollo
   */
  log: (...args: unknown[]): void => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Advertencias - Solo en desarrollo
   */
  warn: (...args: unknown[]): void => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Errores - Siempre se muestran (necesarios para debugging en producción)
   * En un futuro se podría integrar con un servicio de monitoreo (Sentry, etc.)
   */
  error: (...args: unknown[]): void => {
    console.error(...args);
  },

  /**
   * Info - Solo en desarrollo
   */
  info: (...args: unknown[]): void => {
    if (isDev) {
      console.info(...args);
    }
  },

  /**
   * Debug con contexto - Solo en desarrollo
   * Útil para debugging con prefijo
   */
  debug: (context: string, ...args: unknown[]): void => {
    if (isDev) {
      console.log(`[${context}]`, ...args);
    }
  },
};

export default logger;
