// store/appConfigStore.ts
// Store de configuración de la aplicación (cargada desde el servidor, cacheada en localStorage).
import { create } from 'zustand';
import { logger } from '../utils/logger';
import { getAppConfig } from '../services/api';
import { PAGINATION, VALIDATION, TIMEOUTS, IMAGE_CONFIG } from '../constants/config';
import type { AppConfig } from '../types/models';

const DEFAULT_CONFIG: AppConfig = {
  tax_rate: { iva: 0.15 },
  pagination: {
    default_page_size: PAGINATION.DEFAULT_PAGE_SIZE,
    page_size_options: [...PAGINATION.PAGE_SIZE_OPTIONS],
  },
  validation: {
    phone_length: VALIDATION.PHONE_LENGTH,
    password_min_length: VALIDATION.PASSWORD_MIN_LENGTH,
  },
  timeouts: {
    toast_default: TIMEOUTS.TOAST_DEFAULT,
    toast_short: TIMEOUTS.TOAST_SHORT,
    toast_long: TIMEOUTS.TOAST_LONG,
    message_display: TIMEOUTS.MESSAGE_DISPLAY,
    redirect_delay: TIMEOUTS.REDIRECT_DELAY,
    polling_interval: TIMEOUTS.POLLING_INTERVAL,
    clock_interval: TIMEOUTS.CLOCK_INTERVAL,
  },
  image: {
    max_size_mb: IMAGE_CONFIG.MAX_SIZE_MB,
    max_size_bytes: IMAGE_CONFIG.MAX_SIZE_BYTES,
    allowed_types: [...IMAGE_CONFIG.ALLOWED_TYPES],
  },
  limits: { max_product_price: 9999999.99, max_quantity: 99999 },
};

function getInitialConfig(): AppConfig {
  try {
    const stored = localStorage.getItem('appConfig');
    if (stored) return JSON.parse(stored) as AppConfig;
  } catch { /* ignore */ }
  return DEFAULT_CONFIG;
}

interface AppConfigStore {
  appConfig: AppConfig;
  configLoaded: boolean;
  configError: string | null;
  fetchAppConfig: (signal?: AbortSignal) => Promise<void>;
}

export const useAppConfigStore = create<AppConfigStore>()((set) => ({
  appConfig: getInitialConfig(),
  configLoaded: false,
  configError: null,

  fetchAppConfig: async (signal?: AbortSignal): Promise<void> => {
    try {
      const res = await getAppConfig(signal ? { signal } : {});
      if (res.aborted) return;
      if (res.ok && res.data) {
        const config = res.data as AppConfig;
        set({ appConfig: config, configLoaded: true, configError: null });
        try { localStorage.setItem('appConfig', JSON.stringify(config)); } catch { /* ignore */ }
      } else if (!res.ok) {
        logger.error('Error fetching app config: status', res.status);
        set({ configError: 'No se pudo cargar la configuración del servidor. Se usarán valores por defecto.' });
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      logger.error('Error fetching app config:', error);
      set({ configError: 'No se pudo cargar la configuración del servidor. Se usarán valores por defecto.' });
    }
  },
}));
