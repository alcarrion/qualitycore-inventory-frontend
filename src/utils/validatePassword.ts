// src/utils/validatePassword.ts
import { ERRORS } from "../constants/messages";

interface PasswordValidationResult {
  valid: boolean;
  error: string | null;
}

/**
 * Validates password strength requirements
 * @param password - The password to validate
 * @param confirmPassword - Optional confirmation password to check match
 * @returns Validation result with valid flag and error message
 */
export function validatePassword(
  password: string,
  confirmPassword: string | null = null
): PasswordValidationResult {
  if (password.length < 8) {
    return { valid: false, error: ERRORS.PASSWORD_MIN_LENGTH };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: ERRORS.PASSWORD_UPPERCASE };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: ERRORS.PASSWORD_LOWERCASE };
  }

  if (!/\d/.test(password)) {
    return { valid: false, error: ERRORS.PASSWORD_NUMBER };
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;~`]/.test(password)) {
    return { valid: false, error: ERRORS.PASSWORD_SPECIAL };
  }

  if (confirmPassword !== null && password !== confirmPassword) {
    return { valid: false, error: ERRORS.PASSWORD_MISMATCH };
  }

  return { valid: true, error: null };
}
