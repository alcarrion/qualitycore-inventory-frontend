// src/contexts/AppContext.tsx
// Coordinador delgado: envuelve ToastProvider + ThemeProvider y añade isLoading.
// useApp() sigue devolviendo AppContextValue completo → 0 cambios en consumidores.
import React, { createContext, useContext, useState, useCallback } from "react";
import { ToastProvider, useToast } from './ToastContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import type { AppContextValue } from '../types/context';

interface LoadingContextValue {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const setLoading = useCallback((loading: boolean): void => setIsLoading(loading), []);
  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ThemeProvider>
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}

export function useApp(): AppContextValue {
  const toast = useToast();
  const theme = useTheme();
  const loading = useContext(LoadingContext);
  if (!loading) throw new Error("useApp debe ser usado dentro de AppProvider");
  return { ...toast, ...theme, isLoading: loading.isLoading, setLoading: loading.setLoading };
}
