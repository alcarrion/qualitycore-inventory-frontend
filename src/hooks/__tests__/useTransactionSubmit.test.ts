// hooks/__tests__/useTransactionSubmit.test.ts
import { renderHook, act } from "@testing-library/react";
import { useTransactionSubmit } from "../useTransactionSubmit";
import { useApp } from "../../contexts/AppContext";
import { useMasterDataStore } from "../../store/masterDataStore";
import {
  postSale,
  postPurchase,
  checkStock,
  postCorrection,
  getSale,
  getPurchase,
} from "../../services/api";
import type { Product } from "../../types/models";
import type { CartItem } from "../../types/ui";

jest.mock("../../contexts/AppContext", () => ({
  useApp: jest.fn(),
}));

jest.mock("../../store/masterDataStore", () => ({
  useMasterDataStore: jest.fn(),
}));

jest.mock("../../services/api", () => ({
  postSale: jest.fn(),
  postPurchase: jest.fn(),
  checkStock: jest.fn(),
  postCorrection: jest.fn(),
  getSale: jest.fn(),
  getPurchase: jest.fn(),
}));

// ---- helpers ----

const makeProduct = (id: number): Product =>
  ({ id, name: `P${id}`, price: 10, current_stock: 20 } as Product);

const makeCartItem = (id: number, quantity = 2): CartItem => ({
  product: makeProduct(id),
  quantity,
});

interface Params {
  modalType?: string;
  selectedSupplier?: string | number;
  selectedCustomer?: string | number;
  cart?: CartItem[];
  adjustCartStock?: jest.Mock;
  handleConfirmClose?: jest.Mock;
  loadTransactions?: jest.Mock;
  modal?: {
    setSelectedSale: jest.Mock;
    setSelectedPurchase: jest.Mock;
  };
}

const makeParams = (overrides: Params = {}) => ({
  modalType: "output",
  selectedSupplier: "",
  selectedCustomer: 1,
  cart: [makeCartItem(1)],
  adjustCartStock: jest.fn(),
  handleConfirmClose: jest.fn(),
  loadTransactions: jest.fn(),
  modal: { setSelectedSale: jest.fn(), setSelectedPurchase: jest.fn() },
  ...overrides,
});

// ---- test suite ----

describe("useTransactionSubmit", () => {
  let mockShowSuccess: jest.Mock;
  let mockShowError: jest.Mock;
  let mockFetchAlerts: jest.Mock;
  let mockFetchDashboard: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockShowSuccess = jest.fn();
    mockShowError = jest.fn();
    mockFetchAlerts = jest.fn().mockResolvedValue(undefined);
    mockFetchDashboard = jest.fn().mockResolvedValue(undefined);

    (useApp as jest.Mock).mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError,
    });

    (useMasterDataStore as unknown as jest.Mock).mockImplementation(
      (selector: (s: unknown) => unknown) =>
        selector({
          fetchAlerts: mockFetchAlerts,
          fetchDashboard: mockFetchDashboard,
        })
    );
  });

  // --- handleSubmit ---

  describe("handleSubmit › validation", () => {
    test("no customer selected → shows error, no API call", async () => {
      const params = makeParams({ selectedCustomer: "" });
      const { result } = renderHook(() => useTransactionSubmit(params));

      await act(async () => { await result.current.handleSubmit(); });

      expect(mockShowError).toHaveBeenCalledTimes(1);
      expect(postSale).not.toHaveBeenCalled();
    });

    test("no supplier selected (purchase) → shows error, no API call", async () => {
      const params = makeParams({ modalType: "input", selectedSupplier: "" });
      const { result } = renderHook(() => useTransactionSubmit(params));

      await act(async () => { await result.current.handleSubmit(); });

      expect(mockShowError).toHaveBeenCalledTimes(1);
      expect(postPurchase).not.toHaveBeenCalled();
    });

    test("empty cart → shows error, no API call", async () => {
      const params = makeParams({ cart: [] });
      const { result } = renderHook(() => useTransactionSubmit(params));

      await act(async () => { await result.current.handleSubmit(); });

      expect(mockShowError).toHaveBeenCalledTimes(1);
      expect(postSale).not.toHaveBeenCalled();
    });
  });

  describe("handleSubmit › sale", () => {
    test("stock unavailable → shows error, adjusts cart, does not post", async () => {
      const unavailable = [{ product_id: 1, available: 0 }];
      (checkStock as jest.Mock).mockResolvedValue({
        ok: true,
        data: { all_available: false, unavailable },
      });

      const adjustCartStock = jest.fn();
      const params = makeParams({ adjustCartStock });
      const { result } = renderHook(() => useTransactionSubmit(params));

      await act(async () => { await result.current.handleSubmit(); });

      expect(checkStock).toHaveBeenCalledTimes(1);
      expect(mockShowError).toHaveBeenCalledTimes(1);
      expect(adjustCartStock).toHaveBeenCalledWith(unavailable);
      expect(postSale).not.toHaveBeenCalled();
    });

    test("stock ok → posts sale, reloads data, closes modal, shows success", async () => {
      (checkStock as jest.Mock).mockResolvedValue({
        ok: true,
        data: { all_available: true, unavailable: [] },
      });
      (postSale as jest.Mock).mockResolvedValue({ ok: true, data: {} });

      const handleConfirmClose = jest.fn();
      const loadTransactions = jest.fn();
      const params = makeParams({ handleConfirmClose, loadTransactions });
      const { result } = renderHook(() => useTransactionSubmit(params));

      await act(async () => { await result.current.handleSubmit(); });

      expect(postSale).toHaveBeenCalledWith({
        customer: 1,
        items: [{ product: 1, quantity: 2 }],
      });
      expect(handleConfirmClose).toHaveBeenCalledTimes(1);
      expect(mockShowSuccess).toHaveBeenCalledTimes(1);
      expect(mockFetchAlerts).toHaveBeenCalled();
      expect(loadTransactions).toHaveBeenCalled();
    });

    test("API error → shows error message from response", async () => {
      (checkStock as jest.Mock).mockResolvedValue({
        ok: true,
        data: { all_available: true, unavailable: [] },
      });
      (postSale as jest.Mock).mockResolvedValue({
        ok: false,
        data: { detail: "Stock insuficiente." },
      });

      const params = makeParams();
      const { result } = renderHook(() => useTransactionSubmit(params));

      await act(async () => { await result.current.handleSubmit(); });

      expect(mockShowError).toHaveBeenCalledWith("Stock insuficiente.");
      expect(mockShowSuccess).not.toHaveBeenCalled();
    });
  });

  describe("handleSubmit › purchase", () => {
    test("skips stock check, posts purchase, shows success", async () => {
      (postPurchase as jest.Mock).mockResolvedValue({ ok: true, data: {} });

      const handleConfirmClose = jest.fn();
      const params = makeParams({
        modalType: "input",
        selectedSupplier: 5,
        handleConfirmClose,
      });
      const { result } = renderHook(() => useTransactionSubmit(params));

      await act(async () => { await result.current.handleSubmit(); });

      expect(checkStock).not.toHaveBeenCalled();
      expect(postPurchase).toHaveBeenCalledWith({
        supplier: 5,
        items: [{ product: 1, quantity: 2 }],
      });
      expect(handleConfirmClose).toHaveBeenCalledTimes(1);
      expect(mockShowSuccess).toHaveBeenCalledTimes(1);
    });
  });

  // --- handleCorrection ---

  describe("handleCorrection", () => {
    test("success → returns true, shows success, reloads data", async () => {
      (postCorrection as jest.Mock).mockResolvedValue({ ok: true, data: {} });

      const { result } = renderHook(() => useTransactionSubmit(makeParams()));

      let returnVal!: boolean;
      await act(async () => {
        returnVal = await result.current.handleCorrection(42, { reason: "test" }, null, null);
      });

      expect(returnVal).toBe(true);
      expect(mockShowSuccess).toHaveBeenCalled();
      expect(mockFetchAlerts).toHaveBeenCalled();
    });

    test("failure → returns false, shows error detail", async () => {
      (postCorrection as jest.Mock).mockResolvedValue({
        ok: false,
        data: { detail: "Movimiento ya corregido." },
      });

      const { result } = renderHook(() => useTransactionSubmit(makeParams()));

      let returnVal!: boolean;
      await act(async () => {
        returnVal = await result.current.handleCorrection(99, {}, null, null);
      });

      expect(returnVal).toBe(false);
      expect(mockShowError).toHaveBeenCalledWith("Movimiento ya corregido.");
    });

    test("success with invoiceType='sale' → fetches updated sale and sets it", async () => {
      const fakeSale = { id: 7, total: 100 };
      (postCorrection as jest.Mock).mockResolvedValue({ ok: true, data: {} });
      (getSale as jest.Mock).mockResolvedValue({ ok: true, data: fakeSale });

      const setSelectedSale = jest.fn();
      const params = makeParams({
        modal: { setSelectedSale, setSelectedPurchase: jest.fn() },
      });
      const { result } = renderHook(() => useTransactionSubmit(params));

      await act(async () => {
        await result.current.handleCorrection(10, {}, "sale", 7);
      });

      expect(getSale).toHaveBeenCalledWith(7);
      expect(setSelectedSale).toHaveBeenCalledWith(fakeSale);
    });

    test("success with invoiceType='purchase' → fetches updated purchase and sets it", async () => {
      const fakePurchase = { id: 3, total: 200 };
      (postCorrection as jest.Mock).mockResolvedValue({ ok: true, data: {} });
      (getPurchase as jest.Mock).mockResolvedValue({ ok: true, data: fakePurchase });

      const setSelectedPurchase = jest.fn();
      const params = makeParams({
        modal: { setSelectedSale: jest.fn(), setSelectedPurchase },
      });
      const { result } = renderHook(() => useTransactionSubmit(params));

      await act(async () => {
        await result.current.handleCorrection(20, {}, "purchase", 3);
      });

      expect(getPurchase).toHaveBeenCalledWith(3);
      expect(setSelectedPurchase).toHaveBeenCalledWith(fakePurchase);
    });
  });
});
