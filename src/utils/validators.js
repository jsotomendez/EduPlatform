import { MSG } from '../constants/messages';

/** @param {string} value @returns {string|null} */
export function validateEmail(value) {
  if (!value?.trim()) return MSG.errors.emailRequired;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return MSG.errors.emailInvalid;
  return null;
}

/** @param {string} value @returns {string|null} */
export function validatePassword(value) {
  if (!value) return MSG.errors.passwordRequired;
  if (value.length < 8) return MSG.errors.passwordMin;
  return null;
}

/** @param {string} value @returns {string|null} */
export function validateName(value) {
  if (!value?.trim()) return MSG.errors.nameRequired;
  return null;
}

/**
 * Valida un objeto de campos con funciones validadoras.
 * @param {Record<string, string>} values
 * @param {Record<string, (v: string) => string|null>} validators
 * @returns {{ errors: Record<string, string>, isValid: boolean }}
 */
export function validateForm(values, validators) {
  const errors = {};
  for (const [field, validate] of Object.entries(validators)) {
    const error = validate(values[field]);
    if (error) errors[field] = error;
  }
  return { errors, isValid: Object.keys(errors).length === 0 };
}
