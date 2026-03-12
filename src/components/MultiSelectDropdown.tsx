// components/MultiSelectDropdown.tsx
// Dropdown de selección múltiple con búsqueda y checkboxes.
// Acepta un MultiSelectController<T> generado por useMultiSelect.
import React, { useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { MultiSelectController, MultiSelectItem } from "../hooks/useMultiSelect";
import "../styles/components/MultiSelectDropdown.css";

interface Props<T extends MultiSelectItem> {
  label?: string;
  controller: MultiSelectController<T>;
  /** Texto del trigger cuando no hay nada seleccionado */
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export default function MultiSelectDropdown<T extends MultiSelectItem>({
  label,
  controller,
  placeholder = "Todos",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Sin resultados",
}: Props<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    search, setSearch,
    isOpen, setIsOpen,
    filtered,
    toggle, isSelected,
    selectedIds, selectedNames,
    count,
  } = controller;

  // Cerrar al hacer click fuera del contenedor
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  const triggerText =
    count === 0 ? null :
    count === 1 ? selectedNames[0] :
    `${count} seleccionados`;

  return (
    <div ref={containerRef} className="msd-container">
      {label && <label className="msd-label">{label}</label>}

      <button
        type="button"
        className={[
          "msd-trigger",
          isOpen ? "msd-trigger--open" : "",
          count > 0 ? "msd-trigger--active" : "",
        ].filter(Boolean).join(" ")}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`msd-trigger-text${count === 0 ? " msd-placeholder" : ""}`}>
          {triggerText ?? placeholder}
        </span>
        {count > 0 && <span className="msd-badge">{count}</span>}
        <ChevronDown size={13} className={`msd-chevron${isOpen ? " msd-chevron--open" : ""}`} />
      </button>

      {isOpen && (
        <div className="msd-panel">
          <div className="msd-search-wrap">
            <input
              className="msd-search-input"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="msd-list">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <label
                  key={item.id}
                  className={`msd-option${isSelected(item.id) ? " msd-option--checked" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="msd-checkbox"
                    checked={isSelected(item.id)}
                    onChange={() => toggle(item)}
                  />
                  <span className="msd-option-name">{item.name}</span>
                </label>
              ))
            ) : (
              <div className="msd-empty">{emptyMessage}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
