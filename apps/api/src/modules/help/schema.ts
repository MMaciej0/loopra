import * as z from 'zod';
import { topics } from './systemPrompt.js';
import { ERROR_TYPES } from '@loopra/domain';

export const ReportAnswerInputSchema = z.object({
  topic: z.enum(topics).nullable(),
  fallback: z.boolean(),
});

export const HelpFeedbackParamsSchema = z.object({
  id: z.uuid(ERROR_TYPES.HELP_ANSWER_NOT_FOUND),
});
