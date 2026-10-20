import { z } from 'zod';
import { VALIDATION_ERROR_TYPES } from '../errors.js';
import { CONTACT_MESSAGE_MAX_LENGTH, CONTACT_NAME_MAX_LENGTH } from '../bounds/contact.js';
import { EmailSchema } from './common.js';

const TrimmedRequiredStringSchema = z
  .string(VALIDATION_ERROR_TYPES.REQUIRED)
  .trim()
  .min(1, VALIDATION_ERROR_TYPES.REQUIRED);

export const ContactMessageBodySchema = z.object({
  name: TrimmedRequiredStringSchema.max(
    CONTACT_NAME_MAX_LENGTH,
    VALIDATION_ERROR_TYPES.NAME_TOO_LONG,
  ),
  email: EmailSchema,
  message: TrimmedRequiredStringSchema.max(
    CONTACT_MESSAGE_MAX_LENGTH,
    VALIDATION_ERROR_TYPES.MESSAGE_TOO_LONG,
  ),
  website: z.string().optional(),
});
