// components/SearchableDropdown.js
import React from "react";
import "../styles/components/SearchableDropdown.css";

/**
 * Botón X para limpiar el campo de búsqueda.
 */
export function ClearButton({ onClick }) {
  return (
    <button
      type="button"
      className="sd-clear-btn"
      onClick={onClick}
    >
      ✕
    </button>
  );
}

/**
 * Contenedor desplegable posicionado absolute.
 */
export function DropdownList({ children, maxHeight = "200px" }) {
  return (
    <div className="sd-dropdown-list" style={{ maxHeight }}>
      {children}
    </div>
  );
}

/**
 * Cada opción dentro del dropdown.
 */
export function DropdownItem({ children, onClick, highlighted = false }) {
  return (
    <div
      className={`sd-dropdown-item ${highlighted ? "sd-dropdown-item--highlighted" : ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/**
 * Dropdown con búsqueda reutilizable.
 *
 * Props:
 * - label: etiqueta del campo (opcional)
 * - icon: componente de ícono para la etiqueta (opcional)
 * - dropdown: objeto retornado por useDropdownSearch
 * - otherDropdowns: array de otros dropdowns a cerrar al abrir este (opcional)
 * - onSelect: callback al seleccionar un item
 * - onDeselect: callback al limpiar la selección (opcional)
 * - placeholder: texto placeholder del input
 * - emptyMessage: mensaje cuando no hay resultados
 * - maxItems: máximo de items visibles (default 10)
 * - renderItem: función para renderizar cada item (default: item.name + item.email)
 * - disabled: deshabilitar el input (default false)
 * - className: clase CSS adicional para el contenedor (opcional)
 */
export default function SearchableDropdown({
  label,
  icon,
  dropdown,
  otherDropdowns = [],
  onSelect,
  onDeselect,
  placeholder = "Buscar...",
  emptyMessage = "No se encontraron resultados",
  maxItems = 10,
  renderItem,
  disabled = false,
  className = "",
}) {
  const defaultRenderItem = (item) => (
    <>
      <div style={{ fontWeight: "500" }}>{item.name}</div>
      {item.email && (
        <div style={{ fontSize: "0.85em", color: "var(--text-secondary)" }}>
          {item.email}
        </div>
      )}
    </>
  );

  const itemRenderer = renderItem || defaultRenderItem;

  return (
    <div className={`sd-container ${className}`}>
      {label && (
        <label className="sd-label">
          {icon}
          {label}
        </label>
      )}
      <div className="sd-input-wrapper">
        <input
          type="text"
          value={dropdown.search}
          onChange={(e) => {
            dropdown.setSearch(e.target.value);
            dropdown.setIsOpen(true);
            otherDropdowns.forEach((d) => d.setIsOpen(false));
            if (onDeselect) onDeselect();
          }}
          onFocus={() => {
            dropdown.setIsOpen(true);
            otherDropdowns.forEach((d) => d.setIsOpen(false));
          }}
          onKeyDown={(e) => {
            const selected = dropdown.onKeyDown(e);
            if (selected) onSelect(selected);
          }}
          placeholder={placeholder}
          className="sd-input"
          autoComplete="off"
          disabled={disabled}
          style={{ paddingRight: dropdown.search ? "35px" : "12px" }}
        />
        {dropdown.search && (
          <ClearButton
            onClick={() => {
              dropdown.clear();
              if (onDeselect) onDeselect();
            }}
          />
        )}
      </div>
      {dropdown.isOpen && !disabled && (
        <DropdownList>
          {dropdown.filtered.length > 0 ? (
            dropdown.filtered.slice(0, maxItems).map((item, idx) => (
              <DropdownItem
                key={item.id}
                highlighted={idx === dropdown.highlightedIndex}
                onClick={() => onSelect(item)}
              >
                {itemRenderer(item)}
              </DropdownItem>
            ))
          ) : (
            <div className="sd-empty-message">{emptyMessage}</div>
          )}
        </DropdownList>
      )}
    </div>
  );
}
