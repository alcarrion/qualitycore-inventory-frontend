// src/contexts/AppContext.js
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Cargar preferencia desde localStorage
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });

  // Función para agregar un toast
  const addToast = useCallback((type, message, duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  // Funciones helper para cada tipo
  const showSuccess = useCallback((message) => addToast("success", message), [addToast]);
  const showError = useCallback((message) => addToast("error", message), [addToast]);
  const showWarning = useCallback((message) => addToast("warning", message), [addToast]);
  const showInfo = useCallback((message) => addToast("info", message), [addToast]);

  // Función para remover un toast
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Función para mostrar/ocultar loading global
  const setLoading = useCallback((loading) => {
    setIsLoading(loading);
  }, []);

  // Función para toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const newValue = !prev;
      localStorage.setItem("darkMode", String(newValue));
      return newValue;
    });
  }, []);

  // Aplicar clase dark-mode al body cuando cambie el estado
  useEffect(() => {
    // Aplicar a body y documentElement para consistencia con el script inline del index.html
    if (darkMode) {
      document.body.classList.add("dark-mode");
      document.documentElement.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
      document.documentElement.classList.remove("dark-mode");
    }
  }, [darkMode]);

  const value = {
    // Toast methods
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,

    // Loading state
    isLoading,
    setLoading,

    // Dark mode
    darkMode,
    toggleDarkMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook personalizado para usar el contexto
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp debe ser usado dentro de AppProvider");
  }
  return context;
}
