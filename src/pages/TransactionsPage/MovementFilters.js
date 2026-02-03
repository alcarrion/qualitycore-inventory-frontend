// TransactionsPage/MovementFilters.js
import React from "react";
import { FaSearch } from "react-icons/fa";

/**
 * Componente de filtros para la página de transacciones
 * Maneja búsqueda por texto y filtrado por rango de fechas
 */
function MovementFilters({ searchTerm, onSearchChange, startDate, onStartDateChange, endDate, onEndDateChange, onClearDates }) {
  return (
    <div className="filters-container">
      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Buscar por producto, proveedor, cliente o usuario..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="date-filters">
        <div className="date-filter-group">
          <label className="date-label">Desde:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="date-input"
          />
        </div>

        <div className="date-filter-group">
          <label className="date-label">Hasta:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="date-input"
          />
        </div>

        {(startDate || endDate) && (
          <button
            onClick={onClearDates}
            className="clear-dates-btn"
            title="Limpiar fechas"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}

export default MovementFilters;
