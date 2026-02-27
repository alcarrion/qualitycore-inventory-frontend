// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { AppContextValue } from '../types/context';
import type { Toast, ToastType } from '../types/ui';

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("darkMode") === "true";
    } catch {
      return false;
    }
  });

  const addToast = useCallback((type: ToastType, message: string, duration: number = 5000): void => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const showSuccess = useCallback((message: string): void => addToast("success", message), [addToast]);
  const showError = useCallback((message: string): void => addToast("error", message), [addToast]);
  const showWarning = useCallback((message: string): void => addToast("warning", message), [addToast]);
  const showInfo = useCallback((message: string): void => addToast("info", message), [addToast]);

  const removeToast = useCallback((id: number): void => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const setLoading = useCallback((loading: boolean): void => {
    setIsLoading(loading);
  }, []);

  const toggleDarkMode = useCallback((): void => {
    setDarkMode((prev) => {
      const newValue = !prev;
      try { localStorage.setItem("darkMode", String(newValue)); } catch { /* ignore */ }
      return newValue;
    });
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      document.documentElement.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
      document.documentElement.classList.remove("dark-mode");
    }
  }, [darkMode]);

  const value: AppContextValue = {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    isLoading,
    setLoading,
    darkMode,
    toggleDarkMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp debe ser usado dentro de AppProvider");
  }
  return context;
}
