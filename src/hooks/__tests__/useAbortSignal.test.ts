import { renderHook } from "@testing-library/react";
import { useAbortSignal } from "../useAbortSignal";

describe("useAbortSignal", () => {
  test("returns a function", () => {
    const { result } = renderHook(() => useAbortSignal());
    expect(typeof result.current).toBe("function");
  });

  test("getSignal() returns an AbortSignal", () => {
    const { result } = renderHook(() => useAbortSignal());
    const signal = result.current();
    expect(signal).toBeInstanceOf(AbortSignal);
  });

  test("signal is not aborted initially", () => {
    const { result } = renderHook(() => useAbortSignal());
    const signal = result.current();
    expect(signal.aborted).toBe(false);
  });

  test("signal is aborted when component unmounts", () => {
    const { result, unmount } = renderHook(() => useAbortSignal());
    const signal = result.current();
    unmount();
    expect(signal.aborted).toBe(true);
  });
});
