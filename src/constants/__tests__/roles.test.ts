import { normalizeRole, isSuperAdmin, isAdmin, isUser, ROLES, PERMISSIONS } from "../roles";

describe("normalizeRole", () => {
  test("normalizes SuperAdmin variants", () => {
    expect(normalizeRole("SuperAdmin")).toBe(ROLES.SUPER_ADMIN);
    expect(normalizeRole("superadmin")).toBe(ROLES.SUPER_ADMIN);
    expect(normalizeRole("SUPERADMIN")).toBe(ROLES.SUPER_ADMIN);
  });

  test("normalizes Administrator variants", () => {
    expect(normalizeRole("Administrator")).toBe(ROLES.ADMINISTRATOR);
    expect(normalizeRole("administrator")).toBe(ROLES.ADMINISTRATOR);
    expect(normalizeRole("admin")).toBe(ROLES.ADMINISTRATOR);
  });

  test("normalizes User variants", () => {
    expect(normalizeRole("User")).toBe(ROLES.USER);
    expect(normalizeRole("user")).toBe(ROLES.USER);
    expect(normalizeRole("usuario")).toBe(ROLES.USER);
  });

  test("returns null for unknown role", () => {
    expect(normalizeRole("manager")).toBeNull();
    expect(normalizeRole("guest")).toBeNull();
  });

  test("returns null for null/undefined", () => {
    expect(normalizeRole(null)).toBeNull();
    expect(normalizeRole(undefined)).toBeNull();
  });

  test("returns null for empty string", () => {
    expect(normalizeRole("")).toBeNull();
  });
});

describe("isSuperAdmin", () => {
  test("returns true for SuperAdmin variants", () => {
    expect(isSuperAdmin("SuperAdmin")).toBe(true);
    expect(isSuperAdmin("superadmin")).toBe(true);
  });

  test("returns false for Administrator", () => {
    expect(isSuperAdmin("Administrator")).toBe(false);
  });

  test("returns false for User", () => {
    expect(isSuperAdmin("User")).toBe(false);
  });

  test("returns false for null/undefined", () => {
    expect(isSuperAdmin(null)).toBe(false);
    expect(isSuperAdmin(undefined)).toBe(false);
  });
});

describe("isAdmin", () => {
  test("returns true for SuperAdmin", () => {
    expect(isAdmin("SuperAdmin")).toBe(true);
  });

  test("returns true for Administrator", () => {
    expect(isAdmin("Administrator")).toBe(true);
    expect(isAdmin("admin")).toBe(true);
  });

  test("returns false for regular User", () => {
    expect(isAdmin("User")).toBe(false);
  });

  test("returns false for null/undefined", () => {
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
});

describe("isUser", () => {
  test("returns true for any valid role", () => {
    expect(isUser("SuperAdmin")).toBe(true);
    expect(isUser("Administrator")).toBe(true);
    expect(isUser("User")).toBe(true);
  });

  test("returns false for unknown/null roles", () => {
    expect(isUser(null)).toBe(false);
    expect(isUser(undefined)).toBe(false);
    expect(isUser("unknown")).toBe(false);
  });
});

describe("PERMISSIONS", () => {
  test("SuperAdmin can do everything", () => {
    expect(PERMISSIONS.CAN_DELETE_PRODUCT("SuperAdmin")).toBe(true);
    expect(PERMISSIONS.CAN_DELETE_CUSTOMER("SuperAdmin")).toBe(true);
    expect(PERMISSIONS.CAN_DELETE_SUPPLIER("SuperAdmin")).toBe(true);
    expect(PERMISSIONS.CAN_DELETE_USER("SuperAdmin")).toBe(true);
    expect(PERMISSIONS.CAN_ADD_USER("SuperAdmin")).toBe(true);
  });

  test("Administrator can manage products and customers but not delete users", () => {
    expect(PERMISSIONS.CAN_ADD_PRODUCT("Administrator")).toBe(true);
    expect(PERMISSIONS.CAN_EDIT_PRODUCT("Administrator")).toBe(true);
    expect(PERMISSIONS.CAN_DELETE_PRODUCT("Administrator")).toBe(false);
    expect(PERMISSIONS.CAN_ADD_USER("Administrator")).toBe(false);
  });

  test("User can create movements and customers but not manage products", () => {
    expect(PERMISSIONS.CAN_CREATE_MOVEMENT("User")).toBe(true);
    expect(PERMISSIONS.CAN_ADD_CUSTOMER("User")).toBe(true);
    expect(PERMISSIONS.CAN_ADD_PRODUCT("User")).toBe(false);
    expect(PERMISSIONS.CAN_CREATE_ADJUSTMENT("User")).toBe(false);
  });

  test("null/undefined role has no permissions", () => {
    expect(PERMISSIONS.CAN_CREATE_MOVEMENT(null)).toBe(false);
    expect(PERMISSIONS.CAN_ADD_CUSTOMER(undefined)).toBe(false);
  });
});
