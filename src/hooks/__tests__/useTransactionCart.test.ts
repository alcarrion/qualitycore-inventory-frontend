// hooks/__tests__/useTransactionCart.test.ts
import { renderHook, act } from "@testing-library/react";
import { useTransactionCart } from "../useTransactionCart";
import type { Product } from "../../types/models";

jest.mock("../../contexts/AppContext", () => ({
  useApp: jest.fn().mockReturnValue({ showError: jest.fn() }),
}));

import { useApp } from "../../contexts/AppContext";

const makeProduct = (id: number, stock = 20): Product => ({
  id,
  name: `Product ${id}`,
  price: 10,
  current_stock: stock,
} as Product);

describe("useTransactionCart › handleUpdateCartQuantity", () => {
  let mockShowError: jest.Mock;

  beforeEach(() => {
    mockShowError = jest.fn();
    (useApp as jest.Mock).mockReturnValue({ showError: mockShowError });
  });

  test("qty < 0 → no-op (cart unchanged)", () => {
    const { result } = renderHook(() => useTransactionCart());

    act(() => { result.current.addToCart(makeProduct(1), 3, "input"); });
    act(() => { result.current.handleUpdateCartQuantity(1, -1, "input"); });

    expect(result.current.cart[0].quantity).toBe(3);
    expect(mockShowError).not.toHaveBeenCalled();
  });

  test("qty === 0 → removes item from cart", () => {
    const { result } = renderHook(() => useTransactionCart());

    act(() => { result.current.addToCart(makeProduct(1), 3, "input"); });
    act(() => { result.current.handleUpdateCartQuantity(1, 0, "input"); });

    expect(result.current.cart).toHaveLength(0);
  });

  test("qty > 0, output, stock insufficient → cart unchanged, showError called", () => {
    const { result } = renderHook(() => useTransactionCart());
    const product = makeProduct(1, 5); // stock = 5

    act(() => { result.current.addToCart(product, 2, "output"); }); // qty=2 ≤ stock=5 → ok
    act(() => { result.current.handleUpdateCartQuantity(1, 10, "output"); }); // qty=10 > stock=5

    expect(result.current.cart[0].quantity).toBe(2); // unchanged
    expect(mockShowError).toHaveBeenCalled();
  });

  test("qty > 0, input → updates without stock validation", () => {
    const { result } = renderHook(() => useTransactionCart());
    const product = makeProduct(1, 5); // stock = 5

    act(() => { result.current.addToCart(product, 2, "input"); });
    act(() => { result.current.handleUpdateCartQuantity(1, 100, "input"); }); // qty >> stock, but input

    expect(result.current.cart[0].quantity).toBe(100);
    expect(mockShowError).not.toHaveBeenCalled();
  });
});
