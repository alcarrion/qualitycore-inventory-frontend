import { renderHook, act } from "@testing-library/react";
import { usePolling, POLLING_TIMEOUT } from "../usePolling";
import type { ApiResponse } from "../../types/api";

type StatusData = {
  state: "PENDING" | "STARTED" | "SUCCESS" | "FAILURE";
  download_url?: string;
  error?: string;
};

const makeStatusResponse = (data: StatusData): ApiResponse<StatusData> => ({
  ok: true,
  status: 200,
  data,
});

describe("usePolling", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("starts with isPolling=false, result=null, error=null", () => {
    const mockCheck = jest.fn();
    const { result } = renderHook(() => usePolling(mockCheck));
    expect(result.current.isPolling).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test("start() sets isPolling to true", () => {
    const mockCheck = jest.fn().mockResolvedValue(makeStatusResponse({ state: "PENDING" }));
    const { result } = renderHook(() => usePolling(mockCheck, { interval: 1000 }));

    act(() => { result.current.start("task-123"); });

    expect(result.current.isPolling).toBe(true);
  });

  test("sets result on SUCCESS state", async () => {
    const mockCheck = jest.fn().mockResolvedValue(
      makeStatusResponse({ state: "SUCCESS", download_url: "/media/report.pdf" })
    );
    const { result } = renderHook(() => usePolling(mockCheck, { interval: 1000 }));

    act(() => { result.current.start("task-123"); });

    await act(async () => { jest.advanceTimersByTime(1000); });
    await act(async () => {}); // flush promises

    expect(result.current.result).toBe("/media/report.pdf");
    expect(result.current.isPolling).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("sets error on FAILURE state", async () => {
    const mockCheck = jest.fn().mockResolvedValue(
      makeStatusResponse({ state: "FAILURE", error: "Task crashed" })
    );
    const { result } = renderHook(() => usePolling(mockCheck, { interval: 1000 }));

    act(() => { result.current.start("task-456"); });

    await act(async () => { jest.advanceTimersByTime(1000); });
    await act(async () => {});

    expect(result.current.error).toBe("Task crashed");
    expect(result.current.isPolling).toBe(false);
    expect(result.current.result).toBeNull();
  });

  test("sets POLLING_TIMEOUT error when maxAttempts exceeded", async () => {
    const mockCheck = jest.fn().mockResolvedValue(
      makeStatusResponse({ state: "PENDING" })
    );
    const { result } = renderHook(() =>
      usePolling(mockCheck, { interval: 500, maxAttempts: 2 })
    );

    act(() => { result.current.start("task-789"); });

    // Advance past maxAttempts
    for (let i = 0; i <= 3; i++) {
      await act(async () => { jest.advanceTimersByTime(500); });
      await act(async () => {});
    }

    expect(result.current.error).toBe(POLLING_TIMEOUT);
    expect(result.current.isPolling).toBe(false);
  });

  test("stop() cancels active polling", async () => {
    const mockCheck = jest.fn().mockResolvedValue(
      makeStatusResponse({ state: "PENDING" })
    );
    const { result } = renderHook(() => usePolling(mockCheck, { interval: 1000 }));

    act(() => { result.current.start("task-999"); });
    act(() => { result.current.stop(); });

    expect(result.current.isPolling).toBe(false);

    // Advance time — should not call checkFn again after stop
    const callsAfterStop = mockCheck.mock.calls.length;
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(mockCheck.mock.calls.length).toBe(callsAfterStop);
  });

  test("PENDING state keeps polling going", async () => {
    const mockCheck = jest.fn().mockResolvedValue(
      makeStatusResponse({ state: "PENDING" })
    );
    const { result } = renderHook(() => usePolling(mockCheck, { interval: 1000, maxAttempts: 10 }));

    act(() => { result.current.start("task-pending"); });

    await act(async () => { jest.advanceTimersByTime(1000); });
    await act(async () => {});
    await act(async () => { jest.advanceTimersByTime(1000); });
    await act(async () => {});

    expect(result.current.isPolling).toBe(true);
    expect(result.current.result).toBeNull();
    expect(mockCheck).toHaveBeenCalledTimes(2);
  });
});
