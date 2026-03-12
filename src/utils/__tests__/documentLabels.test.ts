import { getDocumentLabel, getDocumentPlaceholder } from "../documentLabels";

describe("getDocumentLabel", () => {
  test('returns "Cédula" for cedula', () => {
    expect(getDocumentLabel("cedula")).toBe("Cédula");
  });

  test('returns "RUC" for ruc', () => {
    expect(getDocumentLabel("ruc")).toBe("RUC");
  });

  test('returns "Pasaporte" for passport', () => {
    expect(getDocumentLabel("passport")).toBe("Pasaporte");
  });

  test('returns "Documento" for unknown type', () => {
    expect(getDocumentLabel("dni")).toBe("Documento");
    expect(getDocumentLabel("")).toBe("Documento");
  });
});

describe("getDocumentPlaceholder", () => {
  test("returns 10-digit placeholder for cedula", () => {
    expect(getDocumentPlaceholder("cedula")).toBe("10 dígitos");
  });

  test("returns 13-digit placeholder for ruc", () => {
    expect(getDocumentPlaceholder("ruc")).toBe("13 dígitos");
  });

  test("returns alphanumeric placeholder for passport", () => {
    expect(getDocumentPlaceholder("passport")).toContain("alfanumérico");
  });

  test("returns empty string for unknown type", () => {
    expect(getDocumentPlaceholder("other")).toBe("");
  });
});
