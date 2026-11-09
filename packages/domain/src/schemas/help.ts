import { z } from 'zod';
import { ERROR_TYPES, VALIDATION_ERROR_TYPES } from '../errors.js';
import {
  HELP_HISTORY_MAX_MESSAGES,
  HELP_HISTORY_TEXT_MAX_LENGTH,
  HELP_QUESTION_MAX_LENGTH,
} from '../bounds/help.js';
import { HELP_RATINGS, HELP_ROLES, LOCALES } from '../enums.js';

const HelpHistoryMessageSchema = z.object({
  role: z.enum(HELP_ROLES),
  text: z.string().max(HELP_HISTORY_TEXT_MAX_LENGTH, VALIDATION_ERROR_TYPES.HISTORY_TOO_LONG),
});

export const HelpMessageBodySchema = z.object({
  question: z
    .string(VALIDATION_ERROR_TYPES.REQUIRED)
    .trim()
    .min(1, VALIDATION_ERROR_TYPES.REQUIRED)
    .max(HELP_QUESTION_MAX_LENGTH, VALIDATION_ERROR_TYPES.MESSAGE_TOO_LONG),
  locale: z.enum(LOCALES),
  conversationId: z.uuid().optional(),
  history: z
    .array(HelpHistoryMessageSchema)
    .max(HELP_HISTORY_MAX_MESSAGES, VALIDATION_ERROR_TYPES.HISTORY_TOO_LONG)
    .optional(),
});

export const HelpTextEventSchema = z.object({ text: z.string() });

export const HelpDoneEventSchema = z.object({
  answerId: z.uuid(),
  topic: z.string().nullable(),
  fallback: z.boolean(),
});

export const HelpErrorEventSchema = z.object({ type: z.literal(ERROR_TYPES.HELP_UNAVAILABLE) });

export const HelpFeedbackBodySchema = z.object({ rating: z.enum(HELP_RATINGS) });
