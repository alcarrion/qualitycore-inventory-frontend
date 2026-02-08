// ============================================================
// components/ErrorBoundary.js
// Componente que atrapa errores de JavaScript en el árbol de componentes
// ============================================================

import React from 'react';
import { logger } from '../utils/logger';
import '../styles/components/ErrorBoundary.css';

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
    logger.error('ErrorBoundary capturó un error:', error);
    logger.error('Información del componente:', errorInfo.componentStack);

    this.setState({ errorInfo });
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
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <div className="error-boundary__icon-container">
              <svg
                className="error-boundary__icon"
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

            <h1 className="error-boundary__title">Algo salió mal</h1>

            <p className="error-boundary__message">
              Ha ocurrido un error inesperado. Puedes intentar recargar la página
              o contactar a soporte si el problema persiste.
            </p>

            <div className="error-boundary__buttons">
              <button
                onClick={this.handleRetry}
                className="error-boundary__btn error-boundary__btn--retry"
              >
                Intentar de nuevo
              </button>

              <button
                onClick={this.handleReload}
                className="error-boundary__btn error-boundary__btn--reload"
              >
                Recargar página
              </button>
            </div>

            {/* Mostrar detalles del error solo en desarrollo */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary__details">
                <summary className="error-boundary__summary">Detalles técnicos</summary>
                <pre className="error-boundary__error-text">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
