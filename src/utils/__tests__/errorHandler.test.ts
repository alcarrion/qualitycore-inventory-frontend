import {
  handleApiError,
  extractFormErrors,
  setToastHandler,
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../errorHandler";

// Mock clearSession and window.location so 401 handler doesn't break tests
jest.mock("../../services/authService", () => ({
  clearSession: jest.fn(),
  getStoredUser: jest.fn(() => null),
  setStoredUser: jest.fn(),
}));

const { clearSession } = require("../../services/authService");

// Replace window.location with a writable mock
const locationMock = { href: "" };
Object.defineProperty(window, "location", { value: locationMock, writable: true });

beforeEach(() => {
  locationMock.href = "";
  jest.clearAllMocks();
});

// ===================== handleApiError =====================

describe("handleApiError", () => {
  test("401 clears session and redirects to /", () => {
    handleApiError({ status: 401 }, null);
    expect(clearSession).toHaveBeenCalled();
    expect(locationMock.href).toBe("/");
  });

  test("403 returns permission error message", () => {
    const msg = handleApiError({ status: 403 }, null);
    expect(msg).toBeTruthy();
    expect(typeof msg).toBe("string");
  });

  test("404 returns not found message", () => {
    const msg = handleApiError({ status: 404 }, null);
    expect(msg).toContain("no fue encontrado");
  });

  test("500 returns server error message", () => {
    const msg = handleApiError({ status: 500 }, null);
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });

  test("502/503/504 also return server error message", () => {
    [502, 503, 504].forEach((status) => {
      const msg = handleApiError({ status }, null);
      expect(typeof msg).toBe("string");
    });
  });

  test("extracts detail string from response data", () => {
    const msg = handleApiError({ status: 422 }, { detail: "El campo es requerido." });
    expect(msg).toBe("El campo es requerido.");
  });

  test("extracts detail from array", () => {
    const msg = handleApiError({ status: 422 }, { detail: ["Error de validación"] });
    expect(msg).toBe("Error de validación");
  });

  test("extracts message field if no detail", () => {
    const msg = handleApiError({ status: 400 }, { message: "Datos inválidos" });
    expect(msg).toBe("Datos inválidos");
  });

  test("extracts first field error if no detail/message", () => {
    const msg = handleApiError({ status: 400 }, { email: ["El email ya existe"] });
    expect(msg).toBe("El email ya existe");
  });

  test("returns generic message for unknown errors", () => {
    const msg = handleApiError({ status: 418 }, null);
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });
});

// ===================== extractFormErrors =====================

describe("extractFormErrors", () => {
  const fallback = "Error genérico";

  test("returns fallback for null/undefined data", () => {
    expect(extractFormErrors(null, fallback)).toBe(fallback);
    expect(extractFormErrors(undefined, fallback)).toBe(fallback);
  });

  test("returns string directly if data is a string", () => {
    expect(extractFormErrors("Mensaje de error", fallback)).toBe("Mensaje de error");
  });

  test("extracts detail string", () => {
    expect(extractFormErrors({ detail: "Error de servidor" }, fallback)).toBe("Error de servidor");
  });

  test("joins detail array", () => {
    expect(extractFormErrors({ detail: ["Error A", "Error B"] }, fallback)).toBe("Error A. Error B");
  });

  test("extracts field errors from object", () => {
    const result = extractFormErrors({ email: ["ya existe"], name: ["requerido"] }, fallback);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });

  test("returns fallback if no extractable errors", () => {
    expect(extractFormErrors({}, fallback)).toBe(fallback);
  });
});

// ===================== Toast handlers =====================

describe("setToastHandler and toast functions", () => {
  test("showErrorToast calls the registered handler", () => {
    const mockHandler = jest.fn();
    setToastHandler(mockHandler);
    showErrorToast("algo salió mal");
    expect(mockHandler).toHaveBeenCalledWith("error", "algo salió mal");
  });

  test("showSuccessToast calls the registered handler", () => {
    const mockHandler = jest.fn();
    setToastHandler(mockHandler);
    showSuccessToast("éxito");
    expect(mockHandler).toHaveBeenCalledWith("success", "éxito");
  });

  test("showWarningToast calls the registered handler", () => {
    const mockHandler = jest.fn();
    setToastHandler(mockHandler);
    showWarningToast("advertencia");
    expect(mockHandler).toHaveBeenCalledWith("warning", "advertencia");
  });
});
