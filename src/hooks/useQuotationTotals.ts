// src/hooks/useQuotationTotals.ts
// Gestiona el estado financiero (subtotal, IVA, total) y el cálculo de totales.
import { useState, useCallback } from "react";
import type { QuotedProduct } from "../components/QuotedProductRow";

export function useQuotationTotals(taxRate: number) {
  const [subtotal, setSubtotal] = useState<number>(0);
  const [vat, setVat] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const recalculateTotals = useCallback(
    (items: QuotedProduct[]) => {
      const newSubtotal = items.reduce((acc, p) => acc + (Number(p.subtotal) || 0), 0);
      const newVat = newSubtotal * taxRate;
      const newTotal = newSubtotal + newVat;
      setSubtotal(parseFloat(newSubtotal.toFixed(2)));
      setVat(parseFloat(newVat.toFixed(2)));
      setTotal(parseFloat(newTotal.toFixed(2)));
    },
    [taxRate]
  );

  const resetTotals = () => {
    setSubtotal(0);
    setVat(0);
    setTotal(0);
  };

  return { subtotal, vat, total, recalculateTotals, resetTotals };
}
