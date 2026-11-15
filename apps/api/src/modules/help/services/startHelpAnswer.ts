import type { FastifyBaseLogger } from 'fastify';
import type { Db } from '../../../db/index.js';
import type { AppEnv, HelpMessageBody } from '@loopra/domain';
import type { NewHelpAnswer } from '../types.js';
import { createHelpAnswer } from './createHelpAnswer.js';
import type { Message } from '@anthropic-ai/sdk/resources';
import { ReportAnswerInputSchema } from '../schema.js';

export const startHelpAnswer = (
  { db, log }: { db: Db; log: FastifyBaseLogger },
  body: HelpMessageBody,
  site: AppEnv,
  model: string,
) => {
  const startedAt = Date.now();
  let answer = '';

  const base = {
    conversation_id: body.conversationId,
    question: body.question,
    locale: body.locale,
    site,
    version: body.history ? 'v2' : 'v1',
    model,
  } satisfies Partial<NewHelpAnswer>;

  return {
    addText: (text: string) => {
      answer += text;
    },

    saveCompletedAnswer: async (finalMessage: Message) => {
      const { content, usage, stop_reason } = finalMessage;

      const reportAnswerTool = content
        .filter((block) => block.type === 'tool_use')
        .find((block) => block.name === 'report_answer');

      const parsedReport = ReportAnswerInputSchema.safeParse(reportAnswerTool?.input);

      if (!parsedReport.success) {
        log.warn({ input: reportAnswerTool?.input }, 'report_answer missing or invalid');
      }

      const { fallback, topic } = parsedReport.success
        ? parsedReport.data
        : { topic: null, fallback: false };

      log.info({ usage, topic, fallback }, 'help answer done');

      const answerId = await createHelpAnswer(db, {
        ...base,
        answer,
        topic,
        fallback,
        status: 'completed',
        stop_reason,
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        cache_read_tokens: usage.cache_read_input_tokens,
        duration_ms: Date.now() - startedAt,
      });

      return { answerId, topic, fallback };
    },

    saveUnfinishedAnswer: async (status: 'error' | 'aborted') => {
      try {
        await createHelpAnswer(db, {
          ...base,
          answer,
          status,
          duration_ms: Date.now() - startedAt,
        });
      } catch (saveError) {
        log.error(saveError, 'help answer not saved');
      }
    },
  };
};
