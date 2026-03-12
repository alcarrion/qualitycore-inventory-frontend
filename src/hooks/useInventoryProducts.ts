// hooks/useInventoryProducts.ts
// Fetch server-side de productos para InventoryPage con filtros multi-selección,
// búsqueda debounced y paginación.
import { useState, useEffect, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useMultiSelect } from "./useMultiSelect";
import { useSupplierSearch } from "./useSupplierSearch";
import { useMasterDataStore } from "../store/masterDataStore";
import { getProducts } from "../services/api";
import { PAGINATION } from "../constants/config";
import type { Product, Category, Supplier } from "../types/models";
import type { MultiSelectController } from "./useMultiSelect";
import type { PaginatedResponse } from "../types/api";

interface StatusOption {
  id: string;
  name: string;
}

export type ProductWithNames = Product & { category_name: string; supplier_name: string };

const STATUS_OPTIONS: StatusOption[] = [
  { id: "active", name: "Activo" },
  { id: "inactive", name: "Inactivo" },
];

/**
 * Gestiona el fetch server-side de productos para InventoryPage.
 * - Búsqueda debounced (300ms)
 * - Filtros multi-selección: categorías, proveedores y estado
 * - Paginación server-side
 */
export function useInventoryProducts() {
  // Categorías del store (pocas, cargadas en bootstrap — filtro local)
  const categories = useMasterDataStore(useShallow((s) => s.categories));

  const [products, setProducts] = useState<ProductWithNames[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // Token para forzar re-fetch sin cambiar otros deps (ej. tras guardar un producto)
  const [refreshToken, setRefreshToken] = useState(0);
  const [sort, setSort] = useState("-id");

  // ---- Filtros multi-selección ----

  // Categorías: local (todas cargadas en bootstrap)
  const categoriesMulti = useMultiSelect<Category>(categories);

  // Estado: local (solo 2 opciones)
  const statusMulti = useMultiSelect<StatusOption>(STATUS_OPTIONS);

  // Proveedores: lazy server-side — intercept setSearch para lanzar búsqueda al servidor
  const [supplierSearch, setSupplierSearch] = useState("");
  const { suppliers: supplierResults } = useSupplierSearch(supplierSearch);
  const _suppliersMulti = useMultiSelect<Supplier>(supplierResults);

  const clearSuppliersMulti = useCallback(() => {
    setSupplierSearch("");
    _suppliersMulti.clear();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_suppliersMulti.clear]);

  const suppliersMulti: MultiSelectController<Supplier> = {
    ..._suppliersMulti,
    setSearch: (v: string) => {
      setSupplierSearch(v);         // dispara búsqueda server-side
      _suppliersMulti.setSearch(v); // filtra la lista visible
    },
    clear: clearSuppliersMulti,
  };

  // ---- Debounce búsqueda de texto (300ms) ----
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // ---- Volver a página 1 cuando cambia cualquier filtro ----
  // join() convierte arrays a string primitivo → comparación por valor en deps
  const categoryKey = categoriesMulti.selectedIds.join(",");
  const supplierKey = suppliersMulti.selectedIds.join(",");
  const statusKey = statusMulti.selectedIds.join(",");

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryKey, supplierKey, statusKey, sort]);

  // ---- Fetch de productos ----
  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();
    setLoading(true);

    const categoryParam = categoryKey || undefined;
    const supplierParam = supplierKey || undefined;

    // Si solo 1 status seleccionado → filtrar; 0 o 2 → mostrar todos
    const is_active =
      statusMulti.selectedIds.length === 1
        ? statusMulti.selectedIds[0] === "active" ? "true" : "false"
        : undefined;

    getProducts(page, {
      signal: ac.signal,
      search: debouncedSearch || undefined,
      category: categoryParam,
      supplier: supplierParam,
      is_active,
      ordering: sort,
    })
      .then((res) => {
        if (cancelled || res.aborted) return;
        const data = res.data as PaginatedResponse<Product>;
        const results = data?.results ?? [];
        setCount(data?.count ?? 0);
        setProducts(
          results.map((p) => ({
            ...p,
            category_name: p.category_name ?? "-",
            supplier_name: p.supplier_name ?? "-",
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled || (err as Error).name === "AbortError") return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [page, debouncedSearch, categoryKey, supplierKey, statusKey, sort, refreshToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => setRefreshToken((t) => t + 1), []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setSort("-id");
    categoriesMulti.clear();
    clearSuppliersMulti();
    statusMulti.clear();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesMulti.clear, clearSuppliersMulti, statusMulti.clear]);

  const totalPages = Math.max(1, Math.ceil(count / PAGINATION.DEFAULT_PAGE_SIZE));

  return {
    products,
    count,
    loading,
    page,
    setPage,
    totalPages,
    search,
    setSearch,
    categoriesMulti,
    suppliersMulti,
    statusMulti,
    sort,
    setSort,
    clearFilters,
    refresh,
  };
}
