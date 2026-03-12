// components/SearchableDropdown.tsx
import React, { useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import "../styles/components/SearchableDropdown.css";

export interface DropdownItem {
  id: number | string;
  name: string;
}

export interface DropdownController<T extends DropdownItem> {
  search: string;
  setSearch: (val: string) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  filtered: T[];
  select: (displayText: string) => void;
  clear: () => void;
  highlightedIndex: number;
  onKeyDown: (e: KeyboardEvent) => T | null;
}

interface DropdownCloseable {
  setIsOpen: (val: boolean) => void;
}

/**
 * Botón X para limpiar el campo de búsqueda.
 */
export function ClearButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="sd-clear-btn" onClick={onClick}>
      ✕
    </button>
  );
}

/**
 * Contenedor desplegable posicionado absolute.
 */
export function DropdownList({ children, maxHeight = "200px" }: { children: React.ReactNode; maxHeight?: string }) {
  return (
    <div className="sd-dropdown-list" style={{ maxHeight }}>
      {children}
    </div>
  );
}

/**
 * Cada opción dentro del dropdown.
 */
export function DropdownItem({ children, onClick, highlighted = false }: {
  children: React.ReactNode;
  onClick: () => void;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`sd-dropdown-item ${highlighted ? "sd-dropdown-item--highlighted" : ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface SearchableDropdownProps<T extends DropdownItem> {
  label?: string;
  icon?: React.ReactNode;
  dropdown: DropdownController<T>;
  otherDropdowns?: DropdownCloseable[];
  onSelect: (item: T) => void;
  onDeselect?: () => void;
  placeholder?: string;
  emptyMessage?: string;
  maxItems?: number;
  renderItem?: (item: T) => React.ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * Dropdown con búsqueda reutilizable.
 */
export default function SearchableDropdown<T extends DropdownItem>({
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
}: SearchableDropdownProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera del contenedor
  useEffect(() => {
    if (!dropdown.isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        dropdown.setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdown.isOpen, dropdown.setIsOpen]);

  const defaultRenderItem = (item: T) => (
    <>
      <div style={{ fontWeight: "500" }}>{item.name}</div>
      {(item as T & { email?: string }).email && (
        <div style={{ fontSize: "0.85em", color: "var(--text-secondary)" }}>
          {(item as T & { email?: string }).email}
        </div>
      )}
    </>
  );

  const itemRenderer = renderItem ?? defaultRenderItem;

  return (
    <div ref={containerRef} className={`sd-container ${className}`}>
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
