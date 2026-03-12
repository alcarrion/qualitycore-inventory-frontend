// src/contexts/ToastContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import type { Toast, ToastType } from '../types/ui';

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: number) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

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

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast debe ser usado dentro de ToastProvider");
  return context;
}
