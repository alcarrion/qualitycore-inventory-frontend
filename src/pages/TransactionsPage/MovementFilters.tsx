// TransactionsPage/MovementFilters.tsx
import React from "react";
import { Search } from "lucide-react";

interface Props {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  onClearDates: () => void;
}

function MovementFilters({ searchTerm, onSearchChange, startDate, onStartDateChange, endDate, onEndDateChange, onClearDates }: Props) {
  return (
    <div className="filters-container">
      <div className="search-bar">
        <Search size={16} />
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
