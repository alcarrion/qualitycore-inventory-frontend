// hooks/__tests__/useQuotationTotals.test.ts
import { renderHook, act } from "@testing-library/react";
import { useQuotationTotals } from "../useQuotationTotals";
import type { QuotedProduct } from "../../components/QuotedProductRow";

const makeItem = (subtotal: number): QuotedProduct => ({
  product: "1",
  quantity: 1,
  unit_price: subtotal,
  subtotal,
});

describe("useQuotationTotals", () => {
  test("initial state is all zeros", () => {
    const { result } = renderHook(() => useQuotationTotals(0.15));

    expect(result.current.subtotal).toBe(0);
    expect(result.current.vat).toBe(0);
    expect(result.current.total).toBe(0);
  });

  test("empty items → subtotal=0, vat=0, total=0", () => {
    const { result } = renderHook(() => useQuotationTotals(0.15));

    act(() => { result.current.recalculateTotals([]); });

    expect(result.current.subtotal).toBe(0);
    expect(result.current.vat).toBe(0);
    expect(result.current.total).toBe(0);
  });

  test("2 items with taxRate=0.15 → correct totals rounded to 2 decimals", () => {
    const { result } = renderHook(() => useQuotationTotals(0.15));
    const items = [makeItem(100), makeItem(50)]; // subtotal = 150

    act(() => { result.current.recalculateTotals(items); });

    expect(result.current.subtotal).toBe(150);
    expect(result.current.vat).toBe(22.5);       // 150 * 0.15
    expect(result.current.total).toBe(172.5);    // 150 + 22.5
  });

  test("taxRate=0 → vat=0, total=subtotal", () => {
    const { result } = renderHook(() => useQuotationTotals(0));
    const items = [makeItem(200)];

    act(() => { result.current.recalculateTotals(items); });

    expect(result.current.subtotal).toBe(200);
    expect(result.current.vat).toBe(0);
    expect(result.current.total).toBe(200);
  });

  test("resetTotals → all values return to 0", () => {
    const { result } = renderHook(() => useQuotationTotals(0.15));

    act(() => { result.current.recalculateTotals([makeItem(100)]); });
    act(() => { result.current.resetTotals(); });

    expect(result.current.subtotal).toBe(0);
    expect(result.current.vat).toBe(0);
    expect(result.current.total).toBe(0);
  });
});
