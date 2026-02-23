// hooks/useDropdownSearch.js
import { useState, useMemo, useCallback } from "react";

/**
 * Hook reutilizable para dropdowns con búsqueda.
 * Soporta navegación por teclado (Arrow Up/Down, Enter, Escape).
 *
 * @param {Array} items - Lista de objetos con al menos { id, name }
 * @param {Object} options - Opciones opcionales
 * @param {number} options.maxItems - Máximo de ítems visibles (default: 10)
 * @returns {{ search, setSearch, isOpen, setIsOpen, filtered, select, clear, highlightedIndex, onKeyDown }}
 */
export function useDropdownSearch(items, { maxItems = 10 } = {}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const filtered = useMemo(() => {
    const result = items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    // Sin búsqueda: más recientes primero; con búsqueda: alfabético
    result.sort((a, b) =>
      search.trim() === "" ? b.id - a.id : a.name.localeCompare(b.name)
    );
    return result;
  }, [items, search]);

  const visibleItems = useMemo(() => filtered.slice(0, maxItems), [filtered, maxItems]);

  const select = useCallback((displayText) => {
    setSearch(displayText);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const clear = useCallback(() => {
    setSearch("");
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const onKeyDown = useCallback((e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < visibleItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : visibleItems.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < visibleItems.length) {
          // Retornar el ítem seleccionado para que el consumer lo procese
          return visibleItems[highlightedIndex];
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
    return null;
  }, [isOpen, highlightedIndex, visibleItems]);

  return { search, setSearch, isOpen, setIsOpen, filtered, select, clear, highlightedIndex, onKeyDown };
}
