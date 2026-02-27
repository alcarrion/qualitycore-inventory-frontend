import type { Toast, ToastType } from './ui';
import type { User } from './models';

export interface AppContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: number) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export interface LayoutContext {
  user: User;
}
