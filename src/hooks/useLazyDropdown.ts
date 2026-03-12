// hooks/useLazyDropdown.ts
// Encapsula el patrón "intercept" de búsqueda lazy:
//   estado de texto externo (para el hook de fetch) + useDropdownSearch (UI local).
// Uso:
//   const [searchText, setSearchText] = useState("");
//   const { customers } = useCustomerSearch(searchText);
//   const { dropdown, confirmSelection } = useLazyDropdown(customers, setSearchText);
import { useRef, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useDropdownSearch } from "./useDropdownSearch";

interface DropdownItem {
  id: number | string;
  name: string;
}

interface UseLazyDropdownOptions<T> {
  /** Callback ejecutado después de limpiar la selección (ej. resetear ID seleccionado). */
  onAfterClear?: () => void;
  /**
   * Callback ejecutado cuando el usuario confirma una selección.
   * Recibe el item completo — útil cuando el componente necesita el objeto,
   * no solo el texto de display (ej. producto seleccionado para el carrito).
   */
  onConfirm?: (item: T) => void;
}

/**
 * Hook reutilizable para dropdowns con búsqueda lazy (server-side).
 *
 * Combina:
 * - `setExternalSearch`: actualiza el estado de texto usado por el hook de fetch (ej. useCustomerSearch)
 * - `useDropdownSearch`: gestiona el estado de UI (highlight, teclado, isOpen)
 *
 * @returns `{ dropdown, confirmSelection, clear }`
 * - `dropdown`: versión extendida de useDropdownSearch con setSearch/clear sincronizados
 * - `confirmSelection(item, displayText)`: llama onConfirm(item) + _dropdown.select + limpia búsqueda
 * - `clear`: limpia todo (texto externo, UI, ejecuta onAfterClear si se pasó)
 */
export function useLazyDropdown<T extends DropdownItem>(
  items: T[],
  setExternalSearch: Dispatch<SetStateAction<string>>,
  options: UseLazyDropdownOptions<T> = {}
) {
  // Refs para evitar que los callbacks se recreen cuando se pasan funciones inline
  const onAfterClearRef = useRef(options.onAfterClear);
  onAfterClearRef.current = options.onAfterClear;
  const onConfirmRef = useRef(options.onConfirm);
  onConfirmRef.current = options.onConfirm;

  const _dropdown = useDropdownSearch<T>(items);

  const setSearch = useCallback(
    (v: string) => {
      setExternalSearch(v);
      _dropdown.setSearch(v);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setExternalSearch, _dropdown.setSearch]
  );

  const clear = useCallback(() => {
    setExternalSearch("");
    _dropdown.clear();
    onAfterClearRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setExternalSearch, _dropdown.clear]);

  /**
   * Fija el texto visible del input, limpia el texto de búsqueda externo
   * y ejecuta onConfirm con el item seleccionado.
   */
  const confirmSelection = useCallback(
    (item: T, displayText: string) => {
      onConfirmRef.current?.(item);
      _dropdown.select(displayText);
      setExternalSearch("");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [_dropdown.select, setExternalSearch]
  );

  return {
    dropdown: { ..._dropdown, setSearch, clear },
    confirmSelection,
    clear,
  };
}
