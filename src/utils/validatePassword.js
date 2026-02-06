// src/utils/validatePassword.js
import { ERRORS } from "../constants/messages";

/**
 * Validates password strength requirements
 * @param {string} password - The password to validate
 * @param {string} [confirmPassword] - Optional confirmation password to check match
 * @returns {{ valid: boolean, error: string|null }} Validation result
 */
export function validatePassword(password, confirmPassword = null) {
  // Check minimum length (8 characters)
  if (password.length < 8) {
    return { valid: false, error: ERRORS.PASSWORD_MIN_LENGTH };
  }

  // Check uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: ERRORS.PASSWORD_UPPERCASE };
  }

  // Check lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: ERRORS.PASSWORD_LOWERCASE };
  }

  // Check number
  if (!/\d/.test(password)) {
    return { valid: false, error: ERRORS.PASSWORD_NUMBER };
  }

  // Check special character
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;~`]/.test(password)) {
    return { valid: false, error: ERRORS.PASSWORD_SPECIAL };
  }

  // Check password match if confirmation provided
  if (confirmPassword !== null && password !== confirmPassword) {
    return { valid: false, error: ERRORS.PASSWORD_MISMATCH };
  }

  return { valid: true, error: null };
}
