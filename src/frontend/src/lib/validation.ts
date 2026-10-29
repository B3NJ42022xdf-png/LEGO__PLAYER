export const MIN_PASSWORD_LENGTH = 12;

export const INVALID_EMAIL_MESSAGE = "Ingresa un correo electrónico válido";
export const SHORT_PASSWORD_MESSAGE = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidPassword(value: string): boolean {
  return value.length >= MIN_PASSWORD_LENGTH;
}

export function emailError(value: string): string | null {
  if (value.trim() === "") return "Introduce tu correo electrónico.";
  if (!isValidEmail(value)) return INVALID_EMAIL_MESSAGE;
  return null;
}

export function passwordError(value: string): string | null {
  if (value === "") return "Introduce tu contraseña.";
  if (!isValidPassword(value)) return SHORT_PASSWORD_MESSAGE;
  return null;
}
