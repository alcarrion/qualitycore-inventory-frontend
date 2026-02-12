import { validatePassword } from "../validatePassword";

describe("validatePassword", () => {
  test("accepts a valid password", () => {
    const result = validatePassword("Abc12345!");
    expect(result).toEqual({ valid: true, error: null });
  });

  test("rejects password shorter than 8 characters", () => {
    const result = validatePassword("Ab1!");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/8 caracteres/);
  });

  test("rejects password without uppercase letter", () => {
    const result = validatePassword("abcdefg1!");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/mayúscula/);
  });

  test("rejects password without lowercase letter", () => {
    const result = validatePassword("ABCDEFG1!");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/minúscula/);
  });

  test("rejects password without number", () => {
    const result = validatePassword("Abcdefgh!");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/número/);
  });

  test("rejects password without special character", () => {
    const result = validatePassword("Abcdefg1");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/especial/);
  });

  test("rejects when confirmation does not match", () => {
    const result = validatePassword("Abc12345!", "Different1!");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/no coinciden/);
  });

  test("accepts when confirmation matches", () => {
    const result = validatePassword("Abc12345!", "Abc12345!");
    expect(result).toEqual({ valid: true, error: null });
  });

  test("skips confirmation check when null", () => {
    const result = validatePassword("Abc12345!", null);
    expect(result).toEqual({ valid: true, error: null });
  });
});
