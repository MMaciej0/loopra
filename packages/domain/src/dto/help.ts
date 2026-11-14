import type { z } from 'zod';
import type {
  HelpDoneEventSchema,
  HelpErrorEventSchema,
  HelpFeedbackBodySchema,
  HelpFeedbackResponseSchema,
  HelpMessageBodySchema,
  HelpTextEventSchema,
} from '../schemas/help.js';

export type HelpMessageBody = z.output<typeof HelpMessageBodySchema>;
export type HelpTextEvent = z.output<typeof HelpTextEventSchema>;
export type HelpDoneEvent = z.output<typeof HelpDoneEventSchema>;
export type HelpErrorEvent = z.output<typeof HelpErrorEventSchema>;
export type HelpFeedbackBody = z.output<typeof HelpFeedbackBodySchema>;
export type HelpFeedbackResponse = z.output<typeof HelpFeedbackResponseSchema>;
