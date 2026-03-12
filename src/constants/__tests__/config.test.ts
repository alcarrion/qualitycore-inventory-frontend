import { TIMEOUTS, IMAGE_CONFIG, PAGINATION, VALIDATION, RETRY_CONFIG } from "../config";

describe("TIMEOUTS", () => {
  test("has positive numeric values", () => {
    expect(TIMEOUTS.TOAST_DEFAULT).toBeGreaterThan(0);
    expect(TIMEOUTS.TOAST_SHORT).toBeGreaterThan(0);
    expect(TIMEOUTS.TOAST_LONG).toBeGreaterThan(0);
    expect(TIMEOUTS.API_TIMEOUT).toBeGreaterThan(0);
    expect(TIMEOUTS.POLLING_INTERVAL).toBeGreaterThan(0);
  });

  test("TOAST_SHORT < TOAST_DEFAULT < TOAST_LONG", () => {
    expect(TIMEOUTS.TOAST_SHORT).toBeLessThan(TIMEOUTS.TOAST_DEFAULT);
    expect(TIMEOUTS.TOAST_DEFAULT).toBeLessThan(TIMEOUTS.TOAST_LONG);
  });
});

describe("IMAGE_CONFIG", () => {
  test("MAX_SIZE_BYTES equals MAX_SIZE_MB * 1024 * 1024", () => {
    expect(IMAGE_CONFIG.MAX_SIZE_BYTES).toBe(IMAGE_CONFIG.MAX_SIZE_MB * 1024 * 1024);
  });

  test("ALLOWED_TYPES includes jpeg and png", () => {
    expect(IMAGE_CONFIG.ALLOWED_TYPES).toContain("image/jpeg");
    expect(IMAGE_CONFIG.ALLOWED_TYPES).toContain("image/png");
  });

  test("MIN dimensions are smaller than MAX dimensions", () => {
    expect(IMAGE_CONFIG.MIN_WIDTH).toBeLessThan(IMAGE_CONFIG.MAX_WIDTH);
    expect(IMAGE_CONFIG.MIN_HEIGHT).toBeLessThan(IMAGE_CONFIG.MAX_HEIGHT);
  });
});

describe("PAGINATION", () => {
  test("DEFAULT_PAGE_SIZE is a positive number", () => {
    expect(PAGINATION.DEFAULT_PAGE_SIZE).toBeGreaterThan(0);
  });

  test("PAGE_SIZE_OPTIONS includes DEFAULT_PAGE_SIZE", () => {
    expect(PAGINATION.PAGE_SIZE_OPTIONS).toContain(PAGINATION.DEFAULT_PAGE_SIZE);
  });
});

describe("VALIDATION", () => {
  test("PASSWORD_MIN_LENGTH is at least 8", () => {
    expect(VALIDATION.PASSWORD_MIN_LENGTH).toBeGreaterThanOrEqual(8);
  });

  test("PHONE_LENGTH is a positive number", () => {
    expect(VALIDATION.PHONE_LENGTH).toBeGreaterThan(0);
  });
});

describe("RETRY_CONFIG", () => {
  test("only retries safe HTTP methods", () => {
    expect(RETRY_CONFIG.RETRYABLE_METHODS).toContain("GET");
    expect(RETRY_CONFIG.RETRYABLE_METHODS).not.toContain("POST");
    expect(RETRY_CONFIG.RETRYABLE_METHODS).not.toContain("DELETE");
  });

  test("only retries server error status codes", () => {
    expect(RETRY_CONFIG.RETRYABLE_STATUS_CODES).toContain(500);
    expect(RETRY_CONFIG.RETRYABLE_STATUS_CODES).not.toContain(400);
    expect(RETRY_CONFIG.RETRYABLE_STATUS_CODES).not.toContain(401);
  });
});
