import { ERRORS, SUCCESS, CONFIRM, ENTITIES } from "../messages";

describe("ERRORS", () => {
  test("contains network and connection error messages", () => {
    expect(ERRORS.NETWORK_ERROR).toBeDefined();
    expect(ERRORS.SERVER_ERROR).toBeDefined();
    expect(ERRORS.SESSION_EXPIRED).toBeDefined();
  });

  test("contains validation error messages", () => {
    expect(ERRORS.REQUIRED_FIELDS).toBeDefined();
    expect(ERRORS.INVALID_EMAIL).toBeDefined();
    expect(ERRORS.INVALID_CREDENTIALS).toBeDefined();
  });

  test("contains password error messages", () => {
    expect(ERRORS.PASSWORD_MIN_LENGTH).toBeDefined();
    expect(ERRORS.PASSWORD_UPPERCASE).toBeDefined();
    expect(ERRORS.PASSWORD_LOWERCASE).toBeDefined();
    expect(ERRORS.PASSWORD_NUMBER).toBeDefined();
    expect(ERRORS.PASSWORD_SPECIAL).toBeDefined();
    expect(ERRORS.PASSWORD_MISMATCH).toBeDefined();
  });

  test("IMAGE_DIMENSIONS returns interpolated message", () => {
    const msg = ERRORS.IMAGE_DIMENSIONS(100, 500);
    expect(msg).toContain("100x100");
    expect(msg).toContain("500x500");
  });

  test("STOCK_INSUFFICIENT returns message with available stock", () => {
    expect(ERRORS.STOCK_INSUFFICIENT(5)).toContain("5");
  });

  test("STOCK_INSUFFICIENT includes cart info when provided", () => {
    const msg = ERRORS.STOCK_INSUFFICIENT(3, 2);
    expect(msg).toContain("3");
    expect(msg).toContain("2");
    expect(msg).toContain("carrito");
  });

  test("CREATE_FAILED returns interpolated message", () => {
    expect(ERRORS.CREATE_FAILED("el producto")).toContain("el producto");
  });

  test("PDF_GENERATION_FAILED handles error message", () => {
    expect(ERRORS.PDF_GENERATION_FAILED("timeout")).toContain("timeout");
    expect(ERRORS.PDF_GENERATION_FAILED()).toContain("desconocido");
  });
});

describe("SUCCESS", () => {
  test("contains auth success messages", () => {
    expect(SUCCESS.LOGIN_SUCCESS).toBeDefined();
    expect(SUCCESS.PASSWORD_CHANGED).toBeDefined();
    expect(SUCCESS.PASSWORD_RESET_SUCCESS).toBeDefined();
  });

  test("CREATED returns interpolated message", () => {
    expect(SUCCESS.CREATED("el producto")).toContain("el producto");
  });

  test("TRANSACTION_CREATED returns message with type and count", () => {
    const msg = SUCCESS.TRANSACTION_CREATED("Venta", 3);
    expect(msg).toContain("Venta");
    expect(msg).toContain("3");
  });
});

describe("CONFIRM", () => {
  test("DELETE returns interpolated message", () => {
    const msg = CONFIRM.DELETE("el producto", "Laptop");
    expect(msg).toContain("el producto");
    expect(msg).toContain("Laptop");
  });

  test("contains logout and discard messages", () => {
    expect(CONFIRM.LOGOUT).toBeDefined();
    expect(CONFIRM.DISCARD_CHANGES).toBeDefined();
    expect(CONFIRM.CLOSE_WITHOUT_SAVE).toBeDefined();
  });
});

describe("ENTITIES", () => {
  test("contains all entity labels", () => {
    expect(ENTITIES.PRODUCT).toBeDefined();
    expect(ENTITIES.CUSTOMER).toBeDefined();
    expect(ENTITIES.SUPPLIER).toBeDefined();
    expect(ENTITIES.USER).toBeDefined();
    expect(ENTITIES.CATEGORY).toBeDefined();
  });
});
