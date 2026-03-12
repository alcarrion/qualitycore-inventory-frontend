import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "../Modal";

const renderModal = (props: Partial<React.ComponentProps<typeof Modal>> = {}) => {
  const onClose = props.onClose ?? jest.fn();
  return {
    onClose,
    ...render(
      <Modal onClose={onClose} {...props}>
        <p>Contenido del modal</p>
      </Modal>
    ),
  };
};

describe("Modal — rendering", () => {
  test("renders children", () => {
    renderModal();
    expect(screen.getByText("Contenido del modal")).toBeInTheDocument();
  });

  test("renders title when provided", () => {
    renderModal({ title: "Mi título" });
    expect(screen.getByText("Mi título")).toBeInTheDocument();
  });

  test("does not render title element when title is not provided", () => {
    const { container } = renderModal();
    expect(container.querySelector(".modal-title")).not.toBeInTheDocument();
  });

  test("renders close button", () => {
    renderModal();
    expect(screen.getByLabelText("Cerrar modal")).toBeInTheDocument();
  });

  test("applies extra className to modal content", () => {
    const { container } = renderModal({ className: "wide-modal" });
    expect(container.querySelector(".modal-content")).toHaveClass("wide-modal");
  });
});

describe("Modal — interactions", () => {
  test("calls onClose when close button is clicked", () => {
    const { onClose } = renderModal();
    fireEvent.click(screen.getByLabelText("Cerrar modal"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("calls onClose when overlay (backdrop) is clicked", () => {
    const { onClose, container } = renderModal();
    const overlay = container.querySelector(".modal-overlay")!;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("does NOT call onClose when clicking inside modal content", () => {
    const { onClose, container } = renderModal();
    const content = container.querySelector(".modal-content")!;
    fireEvent.click(content);
    expect(onClose).not.toHaveBeenCalled();
  });

  test("calls onClose when Escape key is pressed", () => {
    const { onClose } = renderModal();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
