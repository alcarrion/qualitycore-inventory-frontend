import {
  validateEcuadorianCedula,
  validateEcuadorianRUC,
  validatePassport,
} from "../ecuadorianValidators";

// ===================== CÉDULA =====================

describe("validateEcuadorianCedula", () => {
  test("accepts a valid cedula", () => {
    // Cédula válida de Pichincha (provincia 17)
    expect(() => validateEcuadorianCedula("1710034065")).not.toThrow();
  });

  test("rejects empty cedula", () => {
    expect(() => validateEcuadorianCedula("")).toThrow(/vacía/);
    expect(() => validateEcuadorianCedula(null)).toThrow(/vacía/);
  });

  test("rejects cedula with wrong length", () => {
    expect(() => validateEcuadorianCedula("12345")).toThrow(/10 dígitos/);
    expect(() => validateEcuadorianCedula("12345678901")).toThrow(/10 dígitos/);
  });

  test("rejects cedula with non-numeric characters", () => {
    expect(() => validateEcuadorianCedula("17ABC34065")).toThrow(/10 dígitos/);
  });

  test("rejects cedula with invalid province (00 or > 24)", () => {
    expect(() => validateEcuadorianCedula("0010034065")).toThrow(/provincia válida/);
    expect(() => validateEcuadorianCedula("2510034065")).toThrow(/provincia válida/);
  });

  test("rejects cedula with third digit > 5", () => {
    expect(() => validateEcuadorianCedula("1760034065")).toThrow(/tercer dígito/);
  });

  test("rejects cedula with invalid check digit", () => {
    expect(() => validateEcuadorianCedula("1710034060")).toThrow(/dígito verificador/);
  });
});

// ===================== RUC =====================

describe("validateEcuadorianRUC", () => {
  test("accepts a valid RUC de persona natural", () => {
    // Cédula válida + 001
    expect(() => validateEcuadorianRUC("1710034065001")).not.toThrow();
  });

  test("rejects empty RUC", () => {
    expect(() => validateEcuadorianRUC("")).toThrow(/vacío/);
    expect(() => validateEcuadorianRUC(null)).toThrow(/vacío/);
  });

  test("rejects RUC with wrong length", () => {
    expect(() => validateEcuadorianRUC("123456")).toThrow(/13 dígitos/);
  });

  test("rejects RUC with invalid province", () => {
    expect(() => validateEcuadorianRUC("2510034065001")).toThrow(/provincia válida/);
  });

  test("rejects RUC persona natural that does not end in 001", () => {
    expect(() => validateEcuadorianRUC("1710034065002")).toThrow(/terminar en 001/);
  });

  test("rejects RUC with invalid third digit (7 or 8)", () => {
    expect(() => validateEcuadorianRUC("1770000000001")).toThrow(/tipo válido/);
  });

  test("rejects RUC sociedad privada with invalid check digit", () => {
    // Tercer dígito = 9, pero dígito verificador incorrecto
    expect(() => validateEcuadorianRUC("1790000000001")).toThrow();
  });

  test("rejects RUC sociedad pública with invalid check digit", () => {
    // Tercer dígito = 6, pero dígito verificador incorrecto
    expect(() => validateEcuadorianRUC("1760000000001")).toThrow();
  });
});

// ===================== PASAPORTE =====================

describe("validatePassport", () => {
  test("accepts a valid passport", () => {
    expect(() => validatePassport("AB12345")).not.toThrow();
    expect(() => validatePassport("ABCDEF")).not.toThrow();
    expect(() => validatePassport("123456789")).not.toThrow();
  });

  test("rejects empty passport", () => {
    expect(() => validatePassport("")).toThrow(/vacío/);
    expect(() => validatePassport(null)).toThrow(/vacío/);
  });

  test("rejects passport shorter than 6 characters", () => {
    expect(() => validatePassport("AB123")).toThrow(/entre 6 y 9/);
  });

  test("rejects passport longer than 9 characters", () => {
    expect(() => validatePassport("AB12345678")).toThrow(/entre 6 y 9/);
  });

  test("rejects passport with special characters", () => {
    expect(() => validatePassport("AB-1234")).toThrow(/alfanumérico/);
    expect(() => validatePassport("AB 1234")).toThrow(/alfanumérico/);
  });
});
