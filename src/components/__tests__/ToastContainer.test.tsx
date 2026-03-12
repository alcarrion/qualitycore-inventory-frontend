import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ToastContainer from "../ToastContainer";
import type { Toast } from "../../types/ui";

const makeToast = (id: number, message: string): Toast => ({
  id,
  type: "success",
  message,
  duration: 5000,
});

describe("ToastContainer", () => {
  test("renders nothing when toasts array is empty", () => {
    const { container } = render(
      <ToastContainer toasts={[]} removeToast={jest.fn()} />
    );
    expect(container.querySelector(".toast-container")).toBeInTheDocument();
    expect(container.querySelectorAll(".toast")).toHaveLength(0);
  });

  test("renders each toast message", () => {
    const toasts = [makeToast(1, "Primer mensaje"), makeToast(2, "Segundo mensaje")];
    render(<ToastContainer toasts={toasts} removeToast={jest.fn()} />);
    expect(screen.getByText("Primer mensaje")).toBeInTheDocument();
    expect(screen.getByText("Segundo mensaje")).toBeInTheDocument();
  });

  test("calls removeToast with the correct id when close button is clicked", () => {
    const removeToast = jest.fn();
    const toasts = [makeToast(42, "Cerrar este")];
    render(<ToastContainer toasts={toasts} removeToast={removeToast} />);
    fireEvent.click(screen.getByRole("button"));
    expect(removeToast).toHaveBeenCalledWith(42);
  });

  test("renders multiple toasts independently", () => {
    const toasts = [1, 2, 3].map((id) => makeToast(id, `Toast ${id}`));
    render(<ToastContainer toasts={toasts} removeToast={jest.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });
});
