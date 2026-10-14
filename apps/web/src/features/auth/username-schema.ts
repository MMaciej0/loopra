import z from 'zod';
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '@loopra/domain';
import { APP_ERROR_TYPES } from '@loopra/domain';

export const usernameSchema = z
  .string()
  .trim()
  .min(1, APP_ERROR_TYPES.REQUIRED)
  .min(USERNAME_MIN_LENGTH, APP_ERROR_TYPES.USERNAME_TOO_SHORT)
  .max(USERNAME_MAX_LENGTH, APP_ERROR_TYPES.USERNAME_TOO_LONG);
