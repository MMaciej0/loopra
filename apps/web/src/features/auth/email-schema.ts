import z from 'zod';
import { APP_ERROR_TYPES } from '@loopra/domain';
import { EmailSchema } from '@loopra/domain/schemas';

export const emailSchema = z.string().min(1, APP_ERROR_TYPES.REQUIRED).pipe(EmailSchema);
