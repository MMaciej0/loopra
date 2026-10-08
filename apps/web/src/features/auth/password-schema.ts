import z from 'zod';
import { APP_ERROR_TYPES } from '@/lib/errors';

export const passwordSchema = z
  .string()
  .min(1, APP_ERROR_TYPES.REQUIRED)
  .min(8, APP_ERROR_TYPES.PASSWORD_TOO_SHORT)
  .regex(/[A-Z]/, APP_ERROR_TYPES.PASSWORD_REQUIRES_UPPERCASE)
  .regex(/[^A-Za-z0-9]/, APP_ERROR_TYPES.PASSWORD_REQUIRES_SPECIAL_CHAR);
