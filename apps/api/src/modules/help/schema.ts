import * as z from 'zod';
import { topics } from './systemPrompt.js';

export const ReportAnswerInputSchema = z.object({
  topic: z.enum(topics).nullable(),
  fallback: z.boolean(),
});
