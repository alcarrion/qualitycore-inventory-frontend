describe("logger", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
    // Clear module cache so logger re-evaluates NODE_ENV
    jest.resetModules();
  });

  test("logger.error always logs regardless of environment", () => {
    // In test environment (not development), error should still log
    const { logger } = require("../logger");
    logger.error("test error");
    expect(console.error).toHaveBeenCalledWith("test error");
  });

  test("logger.log does not log in production", () => {
    process.env.NODE_ENV = "production";
    const { logger } = require("../logger");
    logger.log("should not appear");
    expect(console.log).not.toHaveBeenCalled();
  });

  test("logger.warn does not log in production", () => {
    process.env.NODE_ENV = "production";
    const { logger } = require("../logger");
    logger.warn("should not appear");
    expect(console.warn).not.toHaveBeenCalled();
  });

  test("logger.info does not log in production", () => {
    process.env.NODE_ENV = "production";
    const { logger } = require("../logger");
    logger.info("should not appear");
    expect(console.info).not.toHaveBeenCalled();
  });

  test("logger.log logs in development", () => {
    process.env.NODE_ENV = "development";
    const { logger } = require("../logger");
    logger.log("debug info");
    expect(console.log).toHaveBeenCalledWith("debug info");
  });

  test("logger.debug logs with context prefix in development", () => {
    process.env.NODE_ENV = "development";
    const { logger } = require("../logger");
    logger.debug("MyComponent", "some data");
    expect(console.log).toHaveBeenCalledWith("[MyComponent]", "some data");
  });
});
