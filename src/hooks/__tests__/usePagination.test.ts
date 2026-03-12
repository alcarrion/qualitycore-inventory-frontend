import { renderHook, act, waitFor } from "@testing-library/react";
import { usePagination } from "../usePagination";
import type { ApiResponse } from "../../types/api";

type Item = { id: number; name: string };

const makeItems = (count: number): Item[] =>
  Array.from({ length: count }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

const makeResponse = (items: Item[], count = items.length): ApiResponse<{ count: number; results: Item[] }> => ({
  ok: true,
  status: 200,
  data: { count, results: items },
});

const makeErrorResponse = (): ApiResponse<null> => ({
  ok: false,
  status: 500,
  data: null,
});

describe("usePagination — successful fetch", () => {
  test("loads data on fetchPage(1)", async () => {
    const items = makeItems(5);
    const mockFetch = jest.fn().mockResolvedValue(makeResponse(items, 5));
    const { result } = renderHook(() => usePagination(mockFetch, { autoFetch: false }));

    await act(async () => { await result.current.fetchPage(1); });

    expect(result.current.data).toHaveLength(5);
    expect(result.current.totalItems).toBe(5);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("calculates totalPages correctly", async () => {
    const mockFetch = jest.fn().mockResolvedValue(makeResponse(makeItems(20), 45));
    const { result } = renderHook(() => usePagination(mockFetch, { autoFetch: false, pageSize: 20 }));

    await act(async () => { await result.current.fetchPage(1); });

    expect(result.current.totalPages).toBe(3); // ceil(45/20)
  });

  test("hasNextPage is true when not on last page", async () => {
    const mockFetch = jest.fn().mockResolvedValue(makeResponse(makeItems(20), 40));
    const { result } = renderHook(() => usePagination(mockFetch, { autoFetch: false, pageSize: 20 }));

    await act(async () => { await result.current.fetchPage(1); });

    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(false);
  });

  test("hasPrevPage is true when on page 2+", async () => {
    const mockFetch = jest.fn().mockResolvedValue(makeResponse(makeItems(20), 40));
    const { result } = renderHook(() => usePagination(mockFetch, { autoFetch: false, pageSize: 20 }));

    await act(async () => { await result.current.fetchPage(2); });

    expect(result.current.hasPrevPage).toBe(true);
  });
});

describe("usePagination — error handling", () => {
  test("sets error on failed fetch", async () => {
    const mockFetch = jest.fn().mockResolvedValue(makeErrorResponse());
    const { result } = renderHook(() => usePagination<Item>(mockFetch, { autoFetch: false }));

    await act(async () => { await result.current.fetchPage(1); });

    expect(result.current.error).not.toBeNull();
    expect(result.current.data).toHaveLength(0);
  });

  test("sets error on thrown exception", async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error("Network down"));
    const { result } = renderHook(() => usePagination<Item>(mockFetch, { autoFetch: false }));

    await act(async () => { await result.current.fetchPage(1); });

    expect(result.current.error).toBe("Network down");
  });
});

describe("usePagination — navigation", () => {
  test("goToPage navigates to valid page", async () => {
    const mockFetch = jest.fn().mockResolvedValue(makeResponse(makeItems(20), 40));
    const { result } = renderHook(() => usePagination(mockFetch, { autoFetch: false, pageSize: 20 }));

    await act(async () => { await result.current.fetchPage(1); });
    await act(async () => { result.current.goToPage(2); });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
  });

  test("goToPage does not fetch for page 0 or beyond totalPages", async () => {
    const mockFetch = jest.fn().mockResolvedValue(makeResponse(makeItems(20), 20));
    const { result } = renderHook(() => usePagination(mockFetch, { autoFetch: false }));

    await act(async () => { await result.current.fetchPage(1); });
    const callsBefore = mockFetch.mock.calls.length;

    act(() => { result.current.goToPage(0); });
    act(() => { result.current.goToPage(99); });

    expect(mockFetch.mock.calls.length).toBe(callsBefore);
  });

  test("goToFirst goes to page 1", async () => {
    const mockFetch = jest.fn().mockResolvedValue(makeResponse(makeItems(20), 60));
    const { result } = renderHook(() => usePagination(mockFetch, { autoFetch: false, pageSize: 20 }));

    await act(async () => { await result.current.fetchPage(3); });
    await act(async () => { result.current.goToFirst(); });

    await waitFor(() => expect(result.current.currentPage).toBe(1));
  });

  test("goToLast goes to last page", async () => {
    const mockFetch = jest.fn().mockResolvedValue(makeResponse(makeItems(20), 60));
    const { result } = renderHook(() => usePagination(mockFetch, { autoFetch: false, pageSize: 20 }));

    await act(async () => { await result.current.fetchPage(1); });
    await act(async () => { result.current.goToLast(); });

    await waitFor(() => expect(result.current.currentPage).toBe(3));
  });
});

describe("usePagination — filterFn", () => {
  test("filters results after fetching", async () => {
    const allItems = makeItems(10);
    const mockFetch = jest.fn().mockResolvedValue(makeResponse(allItems, 10));
    const filterFn = (item: Item) => item.id % 2 === 0; // only even ids

    const { result } = renderHook(() =>
      usePagination(mockFetch, { autoFetch: false, filterFn })
    );

    await act(async () => { await result.current.fetchPage(1); });

    expect(result.current.data.every((item) => item.id % 2 === 0)).toBe(true);
    expect(result.current.data).toHaveLength(5);
  });
});

describe("usePagination — autoFetch", () => {
  test("fetches on mount when autoFetch is true", async () => {
    const mockFetch = jest.fn().mockResolvedValue(makeResponse(makeItems(5), 5));
    const { result } = renderHook(() => usePagination(mockFetch, { autoFetch: true }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetch).toHaveBeenCalledWith(1);
    expect(result.current.data).toHaveLength(5);
  });
});
