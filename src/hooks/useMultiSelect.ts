// src/hooks/useMultiSelect.ts
// Hook genérico para filtros de selección múltiple con búsqueda.
// Usa un Map internamente para retener los items seleccionados incluso cuando
// salen de la lista (ej. búsqueda lazy server-side en proveedores).
import { useState, useMemo, useCallback } from "react";

export interface MultiSelectItem {
  id: number | string;
  name: string;
}

export interface MultiSelectController<T extends MultiSelectItem> {
  // Búsqueda local sobre la lista visible
  search: string;
  setSearch: (v: string) => void;
  // Apertura del panel
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  // Items visibles (filtrados por search)
  filtered: T[];
  // Selección
  toggle: (item: T) => void;
  isSelected: (id: number | string) => boolean;
  clear: () => void;
  // Derived values para la UI y para la API
  selectedIds: string[];   // ["1","3"] — para pasar al backend
  selectedNames: string[]; // ["Celular","Laptop"] — para tooltip/debug
  count: number;
}

export function useMultiSelect<T extends MultiSelectItem>(items: T[]): MultiSelectController<T> {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  // Map<id, item>: retiene items seleccionados aunque ya no estén en `items`
  const [selectedMap, setSelectedMap] = useState<Map<string, T>>(new Map());

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => item.name.toLowerCase().includes(term));
  }, [items, search]);

  const toggle = useCallback((item: T) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      const id = String(item.id);
      if (next.has(id)) next.delete(id);
      else next.set(id, item);
      return next;
    });
  }, []);

  const isSelected = useCallback(
    (id: number | string) => selectedMap.has(String(id)),
    [selectedMap]
  );

  const clear = useCallback(() => {
    setSelectedMap(new Map());
    setSearch("");
    setIsOpen(false);
  }, []);

  const selectedIds = useMemo(() => Array.from(selectedMap.keys()), [selectedMap]);
  const selectedNames = useMemo(
    () => Array.from(selectedMap.values()).map((i) => i.name),
    [selectedMap]
  );

  return {
    search, setSearch,
    isOpen, setIsOpen,
    filtered,
    toggle, isSelected, clear,
    selectedIds, selectedNames,
    count: selectedMap.size,
  };
}
