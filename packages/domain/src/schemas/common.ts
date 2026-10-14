import { z } from 'zod';
import { VALIDATION_ERROR_TYPES } from '../errors.js';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_SPECIAL_CHAR_PATTERN,
  PASSWORD_UPPERCASE_PATTERN,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '../bounds/user.js';

export const RequiredStringSchema = z
  .string(VALIDATION_ERROR_TYPES.REQUIRED)
  .min(1, VALIDATION_ERROR_TYPES.REQUIRED);

export const EmailSchema = z
  .string(VALIDATION_ERROR_TYPES.REQUIRED)
  .trim()
  .min(1, VALIDATION_ERROR_TYPES.REQUIRED)
  .toLowerCase()
  .pipe(z.email(VALIDATION_ERROR_TYPES.INVALID_EMAIL));

export const PasswordSchema = RequiredStringSchema.min(
  PASSWORD_MIN_LENGTH,
  VALIDATION_ERROR_TYPES.PASSWORD_TOO_SHORT,
)
  .regex(PASSWORD_UPPERCASE_PATTERN, VALIDATION_ERROR_TYPES.PASSWORD_REQUIRES_UPPERCASE)
  .regex(PASSWORD_SPECIAL_CHAR_PATTERN, VALIDATION_ERROR_TYPES.PASSWORD_REQUIRES_SPECIAL_CHAR);

export const UsernameSchema = z
  .string(VALIDATION_ERROR_TYPES.REQUIRED)
  .trim()
  .min(1, VALIDATION_ERROR_TYPES.REQUIRED)
  .min(USERNAME_MIN_LENGTH, VALIDATION_ERROR_TYPES.USERNAME_TOO_SHORT)
  .max(USERNAME_MAX_LENGTH, VALIDATION_ERROR_TYPES.USERNAME_TOO_LONG);

export const IsoDateTime = z.codec(z.iso.datetime(), z.date(), {
  decode: (value) => new Date(value),
  encode: (date) => date.toISOString(),
});
