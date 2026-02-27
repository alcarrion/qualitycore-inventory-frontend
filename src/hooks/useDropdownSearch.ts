// hooks/useDropdownSearch.ts
import { useState, useMemo, useCallback } from "react";
import type { KeyboardEvent } from "react";

interface DropdownItem {
  id: number | string;
  name: string;
}

/**
 * Hook reutilizable para dropdowns con búsqueda.
 * Soporta navegación por teclado (Arrow Up/Down, Enter, Escape).
 *
 * @param items - Lista de objetos con al menos { id, name }
 * @param options - Opciones opcionales
 * @param options.maxItems - Máximo de ítems visibles (default: 10)
 */
export function useDropdownSearch<T extends DropdownItem>(
  items: T[],
  { maxItems = 10 }: { maxItems?: number } = {}
) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const filtered = useMemo(() => {
    const result = items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    // Sin búsqueda: más recientes primero (por id numérico); con búsqueda: alfabético
    result.sort((a, b) => {
      if (search.trim() === "") {
        const diff = Number(b.id) - Number(a.id);
        return isNaN(diff) ? 0 : diff;
      }
      return a.name.localeCompare(b.name);
    });
    return result;
  }, [items, search]);

  const visibleItems = useMemo(() => filtered.slice(0, maxItems), [filtered, maxItems]);

  const select = useCallback((displayText: string): void => {
    setSearch(displayText);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const clear = useCallback((): void => {
    setSearch("");
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const onKeyDown = useCallback((e: KeyboardEvent): T | null => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return null;
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
