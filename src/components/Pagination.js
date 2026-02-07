// components/Pagination.js
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../styles/components/Pagination.css";

/**
 * Componente de paginación reutilizable
 *
 * @param {number} currentPage - Página actual (1-indexed)
 * @param {number} totalPages - Total de páginas
 * @param {function} onPageChange - Callback cuando cambia la página
 * @param {number} totalItems - Total de items (opcional, para mostrar info)
 * @param {number} pageSize - Items por página (opcional, para mostrar info)
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems = null,
  pageSize = 20
}) {
  // No mostrar si solo hay una página o menos
  if (totalPages <= 1) return null;

  // Genera los números de página a mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Máximo de botones de página visibles

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    // Ajustar si estamos cerca del final
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Calcular rango de items mostrados
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || currentPage * pageSize);

  return (
    <div className="pagination-container">
      {/* Info de items */}
      {totalItems && (
        <span className="pagination-info">
          Mostrando {startItem}-{endItem} de {totalItems}
        </span>
      )}

      <div className="pagination-controls">
        {/* Botón Anterior */}
        <button
          className="pagination-btn pagination-nav"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Página anterior"
        >
          <ChevronLeft size={18} />
          <span>Anterior</span>
        </button>

        {/* Primera página si no está visible */}
        {pageNumbers[0] > 1 && (
          <>
            <button
              className="pagination-btn"
              onClick={() => onPageChange(1)}
            >
              1
            </button>
            {pageNumbers[0] > 2 && <span className="pagination-ellipsis">...</span>}
          </>
        )}

        {/* Números de página */}
        {pageNumbers.map((page) => (
          <button
            key={page}
            className={`pagination-btn ${page === currentPage ? "active" : ""}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        {/* Última página si no está visible */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="pagination-ellipsis">...</span>
            )}
            <button
              className="pagination-btn"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Botón Siguiente */}
        <button
          className="pagination-btn pagination-nav"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Página siguiente"
        >
          <span>Siguiente</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
