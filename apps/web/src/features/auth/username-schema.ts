import z from 'zod';
import { APP_ERROR_TYPES } from '@loopra/domain';
import { UsernameSchema } from '@loopra/domain/schemas';

export const usernameSchema = z
  .string()
  .trim()
  .min(1, APP_ERROR_TYPES.REQUIRED)
  .pipe(UsernameSchema);
