import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Pagination from "../Pagination";

const defaultProps = {
  currentPage: 1,
  totalPages: 5,
  onPageChange: jest.fn(),
};

describe("Pagination — visibility", () => {
  test("renders nothing when totalPages is 1", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("renders nothing when totalPages is 0", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} onPageChange={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("renders when totalPages > 1", () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByTitle("Página anterior")).toBeInTheDocument();
    expect(screen.getByTitle("Página siguiente")).toBeInTheDocument();
  });
});

describe("Pagination — navigation buttons", () => {
  test("Previous button is disabled on first page", () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    expect(screen.getByTitle("Página anterior")).toBeDisabled();
  });

  test("Next button is disabled on last page", () => {
    render(<Pagination {...defaultProps} currentPage={5} />);
    expect(screen.getByTitle("Página siguiente")).toBeDisabled();
  });

  test("Previous button is enabled when not on first page", () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    expect(screen.getByTitle("Página anterior")).not.toBeDisabled();
  });

  test("Next button is enabled when not on last page", () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    expect(screen.getByTitle("Página siguiente")).not.toBeDisabled();
  });

  test("clicking Next calls onPageChange with currentPage + 1", () => {
    const onPageChange = jest.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByTitle("Página siguiente"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test("clicking Previous calls onPageChange with currentPage - 1", () => {
    const onPageChange = jest.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByTitle("Página anterior"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});

describe("Pagination — page numbers", () => {
  test("active page button has 'active' class", () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={jest.fn()} />);
    // Find the button with text "3" that is the active page
    const pageButtons = screen.getAllByRole("button");
    const page3 = pageButtons.find((btn) => btn.textContent === "3");
    expect(page3).toHaveClass("active");
  });

  test("clicking a page number calls onPageChange with that page", () => {
    const onPageChange = jest.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);
    const pageButtons = screen.getAllByRole("button");
    const page2 = pageButtons.find((btn) => btn.textContent === "2");
    fireEvent.click(page2!);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  test("shows item count info when totalItems is provided", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={jest.fn()}
        totalItems={50}
        pageSize={20}
      />
    );
    expect(screen.getByText(/Mostrando/)).toBeInTheDocument();
  });
});
