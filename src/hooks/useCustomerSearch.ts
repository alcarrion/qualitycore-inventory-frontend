// hooks/useCustomerSearch.ts
// Búsqueda lazy de clientes — thin wrapper sobre useEntitySearch.
import { useEntitySearch } from "./useEntitySearch";
import { getCustomers } from "../services/api";
import type { Customer } from "../types/models";

export function useCustomerSearch(
  search: string
): { customers: Customer[]; loading: boolean } {
  const { items, loading } = useEntitySearch<Customer>(
    search,
    (page, s, options) => getCustomers(page, s, '', options)
  );
  return { customers: items, loading };
}
