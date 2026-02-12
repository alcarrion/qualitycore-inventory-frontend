import { renderHook, act } from "@testing-library/react";
import { useCart } from "../useCart";

const makeProduct = (id, price = 10, stock = 20) => ({
  id,
  name: `Product ${id}`,
  price,
  current_stock: stock,
});

describe("useCart", () => {
  // ===================== addToCart =====================

  test("adds a product to the cart", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(makeProduct(1), 3, "input");
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(3);
  });

  test("increments quantity when adding same product twice", () => {
    const { result } = renderHook(() => useCart());
    const product = makeProduct(1);

    act(() => {
      result.current.addToCart(product, 2, "input");
    });
    act(() => {
      result.current.addToCart(product, 3, "input");
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(5);
  });

  test("returns false and shows error when product is null", () => {
    const { result } = renderHook(() => useCart());
    const showError = jest.fn();

    let ok;
    act(() => {
      ok = result.current.addToCart(null, 1, "input", showError);
    });

    expect(ok).toBe(false);
    expect(showError).toHaveBeenCalled();
  });

  test("returns false for non-positive quantity", () => {
    const { result } = renderHook(() => useCart());
    const showError = jest.fn();

    let ok;
    act(() => {
      ok = result.current.addToCart(makeProduct(1), 0, "input", showError);
    });

    expect(ok).toBe(false);
    expect(showError).toHaveBeenCalled();
  });

  test("rejects output when stock is insufficient", () => {
    const { result } = renderHook(() => useCart());
    const showError = jest.fn();
    const product = makeProduct(1, 10, 5); // stock = 5

    let ok;
    act(() => {
      ok = result.current.addToCart(product, 10, "output", showError);
    });

    expect(ok).toBe(false);
    expect(showError).toHaveBeenCalled();
  });

  test("allows input regardless of stock", () => {
    const { result } = renderHook(() => useCart());
    const product = makeProduct(1, 10, 5); // stock = 5

    let ok;
    act(() => {
      ok = result.current.addToCart(product, 100, "input");
    });

    expect(ok).toBe(true);
    expect(result.current.cart).toHaveLength(1);
  });

  // ===================== removeFromCart =====================

  test("removes a product from the cart", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(makeProduct(1), 1, "input");
      result.current.addToCart(makeProduct(2), 1, "input");
    });
    act(() => {
      result.current.removeFromCart(1);
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].product.id).toBe(2);
  });

  // ===================== updateCartQuantity =====================

  test("updates the quantity of a cart item", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(makeProduct(1), 2, "input");
    });
    act(() => {
      result.current.updateCartQuantity(1, 5, "input");
    });

    expect(result.current.cart[0].quantity).toBe(5);
  });

  test("rejects update with non-positive quantity", () => {
    const { result } = renderHook(() => useCart());
    const showError = jest.fn();

    act(() => {
      result.current.addToCart(makeProduct(1), 2, "input");
    });

    let ok;
    act(() => {
      ok = result.current.updateCartQuantity(1, -1, "input", showError);
    });

    expect(ok).toBe(false);
    expect(showError).toHaveBeenCalled();
  });

  // ===================== clearCart =====================

  test("clears the cart and resets selections", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(makeProduct(1), 1, "input");
      result.current.setSelectedCustomer("C1");
      result.current.setSelectedSupplier("S1");
    });
    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cart).toHaveLength(0);
    expect(result.current.selectedCustomer).toBe("");
    expect(result.current.selectedSupplier).toBe("");
  });

  // ===================== calculateTotal =====================

  test("calculates total price of cart items", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(makeProduct(1, 10), 2, "input"); // 20
      result.current.addToCart(makeProduct(2, 5), 3, "input");  // 15
    });

    expect(result.current.calculateTotal()).toBe(35);
  });

  test("returns 0 for empty cart", () => {
    const { result } = renderHook(() => useCart());
    expect(result.current.calculateTotal()).toBe(0);
  });
});
