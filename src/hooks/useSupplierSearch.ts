// hooks/useSupplierSearch.ts
// Búsqueda lazy de proveedores — thin wrapper sobre useEntitySearch.
import { useEntitySearch } from "./useEntitySearch";
import { getSuppliers } from "../services/api";
import type { Supplier } from "../types/models";

export function useSupplierSearch(
  search: string
): { suppliers: Supplier[]; loading: boolean } {
  const { items, loading } = useEntitySearch<Supplier>(
    search,
    (page, s, options) => getSuppliers(page, s, '', options)
  );
  return { suppliers: items, loading };
}
