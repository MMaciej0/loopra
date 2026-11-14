import { topics } from './systemPrompt.js';
import type { Tool } from '@anthropic-ai/sdk/resources';

export const reportAnswerTool: Tool = {
  name: 'report_answer',
  description:
    'Reports which Q&A topic the answer came from, and whether the answer is a fallback because the Q&A could not answer the question. Call it once, after the full answer.',
  input_schema: {
    type: 'object',
    properties: {
      topic: { type: ['string', 'null'], enum: [...topics, null] },
      fallback: { type: 'boolean' },
    },
    required: ['topic', 'fallback'],
  },
};
