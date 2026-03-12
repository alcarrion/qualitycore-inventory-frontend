import React from "react";
import { render, screen } from "@testing-library/react";
import LoadingSpinner from "../LoadingSpinner";

describe("LoadingSpinner", () => {
  test("renders with default medium size", () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector(".spinner-medium")).toBeInTheDocument();
  });

  test("renders with small size", () => {
    const { container } = render(<LoadingSpinner size="small" />);
    expect(container.querySelector(".spinner-small")).toBeInTheDocument();
  });

  test("renders with large size", () => {
    const { container } = render(<LoadingSpinner size="large" />);
    expect(container.querySelector(".spinner-large")).toBeInTheDocument();
  });

  test("displays message when provided", () => {
    render(<LoadingSpinner message="Cargando datos..." />);
    expect(screen.getByText("Cargando datos...")).toBeInTheDocument();
  });

  test("does not render message when not provided", () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector(".loading-message")).not.toBeInTheDocument();
  });

  test("renders fullScreen overlay when fullScreen=true", () => {
    const { container } = render(<LoadingSpinner fullScreen />);
    expect(container.querySelector(".loading-overlay")).toBeInTheDocument();
    expect(container.querySelector(".loading-inline")).not.toBeInTheDocument();
  });

  test("renders inline layout by default", () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector(".loading-inline")).toBeInTheDocument();
    expect(container.querySelector(".loading-overlay")).not.toBeInTheDocument();
  });
});
