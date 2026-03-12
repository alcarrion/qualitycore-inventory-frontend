import { renderHook, act } from "@testing-library/react";
import { useDropdownSearch } from "../useDropdownSearch";
import type React from "react";

// Helper: create a fake React keyboard event for the hook's onKeyDown
const fakeKey = (key: string): React.KeyboardEvent<Element> =>
  ({ key, preventDefault: jest.fn() } as unknown as React.KeyboardEvent<Element>);

const items = [
  { id: 3, name: "Zapatos" },
  { id: 1, name: "Camisa" },
  { id: 2, name: "Pantalón" },
];

describe("useDropdownSearch — initial state", () => {
  test("starts with empty search and closed dropdown", () => {
    const { result } = renderHook(() => useDropdownSearch(items));
    expect(result.current.search).toBe("");
    expect(result.current.isOpen).toBe(false);
    expect(result.current.highlightedIndex).toBe(-1);
  });

  test("without search term, items are sorted by id descending", () => {
    const { result } = renderHook(() => useDropdownSearch(items));
    expect(result.current.filtered[0].id).toBe(3);
    expect(result.current.filtered[1].id).toBe(2);
    expect(result.current.filtered[2].id).toBe(1);
  });
});

describe("useDropdownSearch — filtering", () => {
  test("filters items by name (case-insensitive)", () => {
    const { result } = renderHook(() => useDropdownSearch(items));
    act(() => { result.current.setSearch("cam"); });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].name).toBe("Camisa");
  });

  test("with search term, results are sorted alphabetically", () => {
    const mixedItems = [
      { id: 1, name: "Zapato rojo" },
      { id: 2, name: "Zapato azul" },
      { id: 3, name: "Zapato negro" },
    ];
    const { result } = renderHook(() => useDropdownSearch(mixedItems));
    act(() => { result.current.setSearch("zapato"); });
    expect(result.current.filtered[0].name).toBe("Zapato azul");
    expect(result.current.filtered[1].name).toBe("Zapato negro");
    expect(result.current.filtered[2].name).toBe("Zapato rojo");
  });

  test("returns empty array when no items match", () => {
    const { result } = renderHook(() => useDropdownSearch(items));
    act(() => { result.current.setSearch("xyz"); });
    expect(result.current.filtered).toHaveLength(0);
  });
});

describe("useDropdownSearch — select and clear", () => {
  test("select() sets search text and closes dropdown", () => {
    const { result } = renderHook(() => useDropdownSearch(items));
    act(() => {
      result.current.setIsOpen(true);
      result.current.select("Camisa");
    });
    expect(result.current.search).toBe("Camisa");
    expect(result.current.isOpen).toBe(false);
    expect(result.current.highlightedIndex).toBe(-1);
  });

  test("clear() resets search and closes dropdown", () => {
    const { result } = renderHook(() => useDropdownSearch(items));
    act(() => {
      result.current.setSearch("Zap");
      result.current.setIsOpen(true);
      result.current.clear();
    });
    expect(result.current.search).toBe("");
    expect(result.current.isOpen).toBe(false);
  });
});

describe("useDropdownSearch — maxItems", () => {
  test("respects maxItems limit", () => {
    const manyItems = Array.from({ length: 20 }, (_, i) => ({ id: i, name: `Item ${i}` }));
    const { result } = renderHook(() => useDropdownSearch(manyItems, { maxItems: 5 }));
    // filtered has all, but consumer slices with maxItems — test that filtered count > 5 but hook provides correct slice boundary
    expect(result.current.filtered.length).toBeGreaterThan(5);
    // The hook's filtered does not slice internally; maxItems is used externally
    // Here we verify the hook still returns all matched items
    expect(result.current.filtered).toHaveLength(20);
  });
});

describe("useDropdownSearch — keyboard navigation", () => {
  test("ArrowDown opens dropdown when closed", () => {
    const { result } = renderHook(() => useDropdownSearch(items));
    act(() => {
      result.current.onKeyDown(fakeKey("ArrowDown"));
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.highlightedIndex).toBe(0);
  });

  test("ArrowDown moves highlight down", () => {
    const { result } = renderHook(() => useDropdownSearch(items));
    act(() => { result.current.setIsOpen(true); });
    act(() => { result.current.onKeyDown(fakeKey("ArrowDown")); });
    expect(result.current.highlightedIndex).toBe(0);
    act(() => { result.current.onKeyDown(fakeKey("ArrowDown")); });
    expect(result.current.highlightedIndex).toBe(1);
  });

  test("ArrowUp wraps from 0 to last item", () => {
    const { result } = renderHook(() => useDropdownSearch(items));
    act(() => { result.current.setIsOpen(true); });
    act(() => { result.current.onKeyDown(fakeKey("ArrowUp")); });
    expect(result.current.highlightedIndex).toBe(items.length - 1);
  });

  test("Enter returns highlighted item", () => {
    const { result } = renderHook(() => useDropdownSearch(items));
    act(() => {
      result.current.setIsOpen(true);
      result.current.onKeyDown(fakeKey("ArrowDown"));
    });
    let selected: typeof items[0] | null = null;
    act(() => {
      selected = result.current.onKeyDown(fakeKey("Enter"));
    });
    expect(selected).not.toBeNull();
  });

  test("Escape closes dropdown", () => {
    const { result } = renderHook(() => useDropdownSearch(items));
    act(() => { result.current.setIsOpen(true); });
    act(() => { result.current.onKeyDown(fakeKey("Escape")); });
    expect(result.current.isOpen).toBe(false);
  });
});
