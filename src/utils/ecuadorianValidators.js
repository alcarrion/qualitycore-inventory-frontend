/**
 * Validadores para documentos de identificación ecuatorianos
 */

/**
 * Valida cédula ecuatoriana de 10 dígitos usando el algoritmo del módulo 10.
 * @param {string} cedula - Cédula de 10 dígitos
 * @throws {Error} Si la cédula no es válida
 */
export function validateEcuadorianCedula(cedula) {
  if (!cedula) {
    throw new Error("La cédula no puede estar vacía.");
  }

  // Verificar que sean exactamente 10 dígitos
  if (!/^\d{10}$/.test(cedula)) {
    throw new Error("La cédula debe contener exactamente 10 dígitos numéricos.");
  }

  // Los dos primeros dígitos deben corresponder a una provincia válida (01-24)
  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) {
    throw new Error("Los dos primeros dígitos de la cédula deben corresponder a una provincia válida (01-24).");
  }

  // El tercer dígito debe ser menor a 6 (0-5) para cédulas de personas naturales
  if (parseInt(cedula[2], 10) > 5) {
    throw new Error("El tercer dígito de la cédula debe ser menor a 6.");
  }

  // Validación del dígito verificador usando algoritmo módulo 10
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula[i], 10) * coeficientes[i];
    if (valor >= 10) {
      valor -= 9;
    }
    suma += valor;
  }

  const residuo = suma % 10;
  const digitoVerificador = residuo === 0 ? 0 : 10 - residuo;

  if (digitoVerificador !== parseInt(cedula[9], 10)) {
    throw new Error("La cédula ingresada no es válida según el dígito verificador.");
  }
}

/**
 * Valida RUC ecuatoriano de 13 dígitos.
 * Tipos de RUC:
 * - Persona Natural: 10 dígitos de cédula + 001
 * - Sociedad Privada: tercer dígito = 9
 * - Sociedad Pública: tercer dígito = 6
 *
 * @param {string} ruc - RUC de 13 dígitos
 * @throws {Error} Si el RUC no es válido
 */
export function validateEcuadorianRUC(ruc) {
  if (!ruc) {
    throw new Error("El RUC no puede estar vacío.");
  }

  // Verificar que sean exactamente 13 dígitos
  if (!/^\d{13}$/.test(ruc)) {
    throw new Error("El RUC debe contener exactamente 13 dígitos numéricos.");
  }

  // Los dos primeros dígitos deben corresponder a una provincia válida (01-24)
  const provincia = parseInt(ruc.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) {
    throw new Error("Los dos primeros dígitos del RUC deben corresponder a una provincia válida (01-24).");
  }

  const tercerDigito = parseInt(ruc[2], 10);

  // RUC de Persona Natural (tercer dígito < 6)
  if (tercerDigito < 6) {
    // Los primeros 10 dígitos deben ser una cédula válida
    try {
      validateEcuadorianCedula(ruc.substring(0, 10));
    } catch (e) {
      throw new Error(`El RUC de persona natural contiene una cédula inválida: ${e.message}`);
    }

    // Los últimos 3 dígitos deben ser 001
    if (ruc.substring(10, 13) !== "001") {
      throw new Error("El RUC de persona natural debe terminar en 001.");
    }
  }
  // RUC de Sociedad Privada (tercer dígito = 9)
  else if (tercerDigito === 9) {
    // Validar con algoritmo módulo 11 para sociedades privadas
    const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;

    for (let i = 0; i < 9; i++) {
      suma += parseInt(ruc[i], 10) * coeficientes[i];
    }

    const residuo = suma % 11;
    const digitoVerificador = residuo === 0 ? 0 : 11 - residuo;

    if (digitoVerificador !== parseInt(ruc[9], 10)) {
      throw new Error("El RUC de sociedad privada no es válido según el dígito verificador.");
    }

    // Los últimos 3 dígitos deben ser 001
    if (ruc.substring(10, 13) !== "001") {
      throw new Error("El RUC de sociedad privada debe terminar en 001.");
    }
  }
  // RUC de Sociedad Pública (tercer dígito = 6)
  else if (tercerDigito === 6) {
    // Validar con algoritmo módulo 11 para sociedades públicas
    const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;

    for (let i = 0; i < 8; i++) {
      suma += parseInt(ruc[i], 10) * coeficientes[i];
    }

    const residuo = suma % 11;
    const digitoVerificador = residuo === 0 ? 0 : 11 - residuo;

    if (digitoVerificador !== parseInt(ruc[8], 10)) {
      throw new Error("El RUC de sociedad pública no es válido según el dígito verificador.");
    }

    // Los últimos 4 dígitos deben ser 0001
    if (ruc.substring(9, 13) !== "0001") {
      throw new Error("El RUC de sociedad pública debe terminar en 0001.");
    }
  } else {
    throw new Error(`El tercer dígito del RUC (${tercerDigito}) no corresponde a un tipo válido de RUC.`);
  }
}

/**
 * Valida formato de pasaporte: alfanumérico de 6-9 caracteres.
 * @param {string} passport - Pasaporte alfanumérico
 * @throws {Error} Si el pasaporte no es válido
 */
export function validatePassport(passport) {
  if (!passport) {
    throw new Error("El pasaporte no puede estar vacío.");
  }

  // Verificar longitud
  if (passport.length < 6 || passport.length > 9) {
    throw new Error("El pasaporte debe contener entre 6 y 9 caracteres.");
  }

  // Verificar que sea alfanumérico (letras y números, sin espacios ni caracteres especiales)
  if (!/^[a-zA-Z0-9]+$/.test(passport)) {
    throw new Error("El pasaporte debe ser alfanumérico (solo letras y números).");
  }
}
