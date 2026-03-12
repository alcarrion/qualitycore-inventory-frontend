// hooks/__tests__/useBootstrap.test.ts
import { renderHook, act } from "@testing-library/react";
import { useBootstrap } from "../useBootstrap";
import { useAppConfigStore } from "../../store/appConfigStore";
import { useMasterDataStore } from "../../store/masterDataStore";

// useAppConfigStore debe ser callable (hook) Y tener getState (acceso directo al store).
jest.mock("../../store/appConfigStore", () => ({
  useAppConfigStore: Object.assign(
    jest.fn().mockReturnValue(null), // llamado como hook → configError = null
    { getState: jest.fn() },
  ),
}));

jest.mock("../../store/masterDataStore", () => ({
  useMasterDataStore: { getState: jest.fn() },
}));

const makeMasterActions = () => ({
  fetchSuppliers: jest.fn().mockResolvedValue(undefined),
  fetchCategories: jest.fn().mockResolvedValue(undefined),
  fetchAlerts: jest.fn().mockResolvedValue(undefined),
  fetchDashboard: jest.fn().mockResolvedValue(undefined),
});

describe("useBootstrap", () => {
  let mockFetchAppConfig: jest.Mock;
  let masterActions: ReturnType<typeof makeMasterActions>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchAppConfig = jest.fn().mockResolvedValue(undefined);
    masterActions = makeMasterActions();
    (useAppConfigStore.getState as jest.Mock).mockReturnValue({ fetchAppConfig: mockFetchAppConfig });
    (useMasterDataStore.getState as jest.Mock).mockReturnValue(masterActions);
  });

  test("loading starts as false", () => {
    const { result } = renderHook(() => useBootstrap());
    expect(result.current.loading).toBe(false);
  });

  test("loading is false after fetchAll completes", async () => {
    const { result } = renderHook(() => useBootstrap());
    await act(async () => { await result.current.fetchAll(); });
    expect(result.current.loading).toBe(false);
  });

  test("fetchAll calls fetchAppConfig and all 4 master data fetches", async () => {
    const { result } = renderHook(() => useBootstrap());
    await act(async () => { await result.current.fetchAll(); });

    expect(mockFetchAppConfig).toHaveBeenCalledTimes(1);
    expect(masterActions.fetchSuppliers).toHaveBeenCalledTimes(1);
    expect(masterActions.fetchCategories).toHaveBeenCalledTimes(1);
    expect(masterActions.fetchAlerts).toHaveBeenCalledTimes(1);
    expect(masterActions.fetchDashboard).toHaveBeenCalledTimes(1);
  });

  test("passes AbortSignal to all fetch functions", async () => {
    const { result } = renderHook(() => useBootstrap());
    const controller = new AbortController();
    await act(async () => { await result.current.fetchAll(controller.signal); });

    expect(mockFetchAppConfig).toHaveBeenCalledWith(controller.signal);
    expect(masterActions.fetchSuppliers).toHaveBeenCalledWith(controller.signal);
    expect(masterActions.fetchCategories).toHaveBeenCalledWith(controller.signal);
    expect(masterActions.fetchAlerts).toHaveBeenCalledWith(controller.signal);
    expect(masterActions.fetchDashboard).toHaveBeenCalledWith(controller.signal);
  });

  test("fetchAppConfig is awaited before parallel fetches start", async () => {
    const callOrder: string[] = [];
    mockFetchAppConfig.mockImplementation(async () => { callOrder.push("config"); });
    masterActions.fetchSuppliers.mockImplementation(async () => { callOrder.push("suppliers"); });

    const { result } = renderHook(() => useBootstrap());
    await act(async () => { await result.current.fetchAll(); });

    expect(callOrder[0]).toBe("config");
    expect(callOrder).toContain("suppliers");
  });

  test("loading stays false if fetchAll throws", async () => {
    mockFetchAppConfig.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useBootstrap());
    await act(async () => {
      try { await result.current.fetchAll(); } catch { /* expected */ }
    });

    expect(result.current.loading).toBe(false);
  });
});
