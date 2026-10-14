import z from 'zod';
import { APP_ERROR_TYPES } from '@loopra/domain';
import { PasswordSchema } from '@loopra/domain/schemas';

export const passwordSchema = z.string().min(1, APP_ERROR_TYPES.REQUIRED).pipe(PasswordSchema);
