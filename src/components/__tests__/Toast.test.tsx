import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Toast from "../Toast";

describe("Toast — rendering", () => {
  test("renders the message", () => {
    render(<Toast message="Operación exitosa" onClose={jest.fn()} />);
    expect(screen.getByText("Operación exitosa")).toBeInTheDocument();
  });

  test("applies success class for success type", () => {
    const { container } = render(<Toast type="success" message="ok" onClose={jest.fn()} />);
    expect(container.firstChild).toHaveClass("toast-success");
  });

  test("applies error class for error type", () => {
    const { container } = render(<Toast type="error" message="error" onClose={jest.fn()} />);
    expect(container.firstChild).toHaveClass("toast-error");
  });

  test("applies warning class for warning type", () => {
    const { container } = render(<Toast type="warning" message="warn" onClose={jest.fn()} />);
    expect(container.firstChild).toHaveClass("toast-warning");
  });

  test("applies info class by default (no type)", () => {
    const { container } = render(<Toast message="info" onClose={jest.fn()} />);
    expect(container.firstChild).toHaveClass("toast-info");
  });
});

describe("Toast — interactions", () => {
  test("calls onClose when close button is clicked", () => {
    const onClose = jest.fn();
    render(<Toast message="hola" onClose={onClose} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("auto-closes after the specified duration", () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    render(<Toast message="auto" onClose={onClose} duration={3000} />);
    expect(onClose).not.toHaveBeenCalled();
    act(() => { jest.advanceTimersByTime(3000); });
    expect(onClose).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  test("does not auto-close when duration is 0", () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    render(<Toast message="no auto" onClose={onClose} duration={0} />);
    act(() => { jest.advanceTimersByTime(10000); });
    expect(onClose).not.toHaveBeenCalled();
    jest.useRealTimers();
  });
});
