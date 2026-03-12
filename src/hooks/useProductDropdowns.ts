// src/hooks/useProductDropdowns.ts
// Gestiona los datos de dropdowns (categorías, proveedores, estado) para ProductForm.
import { useState, useEffect, useMemo } from "react";
import { getSuppliers, getCategories } from "../services/api";
import { useDropdownSearch } from "./useDropdownSearch";
import { useAbortSignal } from "./useAbortSignal";
import { resolveNullableId } from "../utils/refs";
import type { Product, Category, Supplier } from "../types/models";

interface StatusOption {
  id: string;
  name: string;
}

export function useProductDropdowns(product?: Product | null) {
  const getSignal = useAbortSignal();

  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categoryId, setCategoryId] = useState(
    product ? String(product.category || "") : ""
  );
  const [supplierId, setSupplierId] = useState(
    product ? String(resolveNullableId(product.supplier) ?? "") : ""
  );
  const [statusValue, setStatusValue] = useState(product?.status || "Activo");

  const STATUS_OPTIONS = useMemo(
    (): StatusOption[] => [
      { id: "Activo", name: "Activo" },
      { id: "Inactivo", name: "Inactivo" },
    ],
    []
  );

  const categoryDropdown = useDropdownSearch<Category>(categories);
  const supplierDropdown = useDropdownSearch<Supplier>(suppliers);
  const statusDropdown = useDropdownSearch<StatusOption>(STATUS_OPTIONS);

  useEffect(() => {
    const signal = getSignal();
    (async () => {
      const ps = await getSuppliers(null, "", "", { signal });
      if ((ps as { aborted?: boolean }).aborted) return;
      const suppliersList =
        (ps.data as { results?: Supplier[] } | null)?.results ??
        (Array.isArray(ps.data) ? (ps.data as Supplier[]) : []);
      const filteredSuppliers = suppliersList.filter((p) => !p.deleted_at);
      setSuppliers(filteredSuppliers);

      const cs = await getCategories(null, '', '', { signal });
      if ((cs as { aborted?: boolean }).aborted) return;
      const categoriesList =
        (cs.data as { results?: Category[] } | null)?.results ??
        (Array.isArray(cs.data) ? (cs.data as Category[]) : []);
      setCategories(categoriesList);

      if (product) {
        const pid = resolveNullableId(product.supplier);
        if (pid) {
          const sup = filteredSuppliers.find((s) => s.id === pid);
          if (sup) supplierDropdown.select(sup.name);
        }
        const cid = resolveNullableId(product.category);
        if (cid) {
          const cat = categoriesList.find((c) => c.id === cid);
          if (cat) categoryDropdown.select(cat.name);
        }
      }
    })();

    if (statusValue) {
      const opt = STATUS_OPTIONS.find((o) => o.id === statusValue);
      if (opt) statusDropdown.select(opt.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Intencional: solo inicializa los dropdowns con los datos del producto al montar.
    // Los métodos select/STATUS_OPTIONS son estables; re-correr si product cambia
    // resetearía selecciones que el usuario haya modificado.
  }, []);

  return {
    categories,
    suppliers,
    categoryDropdown,
    supplierDropdown,
    statusDropdown,
    categoryId,
    setCategoryId,
    supplierId,
    setSupplierId,
    statusValue,
    setStatusValue,
  };
}
