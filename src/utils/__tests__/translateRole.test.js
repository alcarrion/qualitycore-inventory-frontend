import { translateRole } from "../translateRole";

describe("translateRole", () => {
  test('translates "superadmin" to "Super Administrador"', () => {
    expect(translateRole("superadmin")).toBe("Super Administrador");
  });

  test('translates "administrator" to "Administrador"', () => {
    expect(translateRole("administrator")).toBe("Administrador");
  });

  test('translates "user" to "Usuario"', () => {
    expect(translateRole("user")).toBe("Usuario");
  });

  test("handles uppercase variants", () => {
    expect(translateRole("SUPERADMIN")).toBe("Super Administrador");
    expect(translateRole("Administrator")).toBe("Administrador");
    expect(translateRole("USER")).toBe("Usuario");
  });

  test("returns the original value for unknown roles", () => {
    expect(translateRole("manager")).toBe("manager");
  });

  test("returns null/undefined for null/undefined input", () => {
    expect(translateRole(null)).toBeNull();
    expect(translateRole(undefined)).toBeUndefined();
  });
});
