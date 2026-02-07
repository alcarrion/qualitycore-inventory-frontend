// ============================================================
// components/ErrorBoundary.js
// Componente que atrapa errores de JavaScript en el árbol de componentes
// ============================================================

import React from 'react';
import { logger } from '../utils/logger';

/**
 * ErrorBoundary - Atrapa errores de renderizado en componentes hijos
 *
 * Debe ser un componente de clase porque React solo permite
 * Error Boundaries con los métodos getDerivedStateFromError y componentDidCatch
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Se llama cuando hay un error durante el renderizado
   * Actualiza el estado para mostrar la UI de error
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Se llama después del error - ideal para logging
   * @param {Error} error - El error que ocurrió
   * @param {Object} errorInfo - Info del componente que falló
   */
  componentDidCatch(error, errorInfo) {
    // Loguear el error para debugging
    logger.error('ErrorBoundary capturó un error:', error);
    logger.error('Información del componente:', errorInfo.componentStack);

    this.setState({ errorInfo });

    // Aquí podrías enviar a un servicio de monitoreo como Sentry
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  /**
   * Reinicia el estado de error para intentar de nuevo
   */
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  /**
   * Recarga la página completamente
   */
  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // UI de error personalizada
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.iconContainer}>
              <svg
                style={styles.icon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 style={styles.title}>Algo salió mal</h1>

            <p style={styles.message}>
              Ha ocurrido un error inesperado. Puedes intentar recargar la página
              o contactar a soporte si el problema persiste.
            </p>

            <div style={styles.buttons}>
              <button
                onClick={this.handleRetry}
                style={styles.retryButton}
              >
                Intentar de nuevo
              </button>

              <button
                onClick={this.handleReload}
                style={styles.reloadButton}
              >
                Recargar página
              </button>
            </div>

            {/* Mostrar detalles del error solo en desarrollo */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Detalles técnicos</summary>
                <pre style={styles.errorText}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    // Si no hay error, renderiza los hijos normalmente
    return this.props.children;
  }
}

// Estilos inline para evitar dependencia de CSS externo
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: '1rem',
  },
  content: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    maxWidth: '28rem',
    width: '100%',
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: '1rem',
  },
  icon: {
    width: '4rem',
    height: '4rem',
    color: '#f59e0b',
    margin: '0 auto',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  message: {
    color: '#6b7280',
    marginBottom: '1.5rem',
    lineHeight: '1.5',
  },
  buttons: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  retryButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  reloadButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  details: {
    marginTop: '1.5rem',
    textAlign: 'left',
  },
  summary: {
    cursor: 'pointer',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  errorText: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    backgroundColor: '#fef2f2',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    color: '#991b1b',
    overflow: 'auto',
    maxHeight: '200px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
};

export default ErrorBoundary;
