import { HelpMessageBodySchema } from '@loopra/domain/schemas';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { askHelp, HELP_MODEL } from './services/ask.js';
import { writeEvent } from '../../utils/serverEvent.js';
import {
  ERROR_TYPES,
  type HelpDoneEvent,
  type HelpErrorEvent,
  type HelpTextEvent,
} from '@loopra/domain';
import { APIUserAbortError } from '@anthropic-ai/sdk';
import { ReportAnswerInputSchema } from './schema.js';
import type { NewHelpAnswer } from './types.js';
import { createHelpAnswer } from './services/createHelpAnswer.js';
import { APP_ENV } from '../../config/env.js';

export const helpRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    '/ask',
    {
      schema: {
        body: HelpMessageBodySchema,
      },
    },
    async (request, reply) => {
      const startedAt = Date.now();
      const stream = askHelp(fastify.anthropic, request.body);

      const base = {
        conversation_id: request.body.conversationId,
        question: request.body.question,
        locale: request.body.locale,
        site: APP_ENV,
        version: request.body.history ? 'v2' : 'v1',
        model: HELP_MODEL,
      } satisfies Partial<NewHelpAnswer>;

      let answer = '';

      const saveUnfinishedAnswer = async (status: 'error' | 'aborted') => {
        try {
          await createHelpAnswer(fastify.db, {
            ...base,
            answer,
            status,
            duration_ms: Date.now() - startedAt,
          });
        } catch (saveError) {
          request.log.error(saveError, 'help answer not saved');
        }
      };

      reply.hijack();
      reply.raw.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
      });

      reply.raw.on('close', () => {
        if (!reply.raw.writableEnded) {
          stream.abort();
        }
      });

      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            answer += event.delta.text;
            writeEvent<HelpTextEvent>(reply, 'text', { text: event.delta.text });
          }
        }

        const { content, usage, stop_reason } = await stream.finalMessage();

        const reportAnswerTool = content
          .filter((block) => block.type === 'tool_use')
          .find((block) => block.name === 'report_answer');

        const parsedReport = ReportAnswerInputSchema.safeParse(reportAnswerTool?.input);

        if (!parsedReport.success) {
          request.log.warn({ input: reportAnswerTool?.input }, 'report_answer missing or invalid');
        }

        const { fallback, topic } = parsedReport.success
          ? parsedReport.data
          : { topic: null, fallback: false };

        request.log.info({ usage, topic, fallback }, 'help answer done');

        const answerId = await createHelpAnswer(fastify.db, {
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

        writeEvent<HelpDoneEvent>(reply, 'done', {
          answerId,
          topic,
          fallback,
        });
      } catch (error) {
        if (error instanceof APIUserAbortError) {
          request.log.info('User aborted help stream');
          await saveUnfinishedAnswer('aborted');
          return;
        }

        request.log.error(error);
        writeEvent<HelpErrorEvent>(reply, 'error', { type: ERROR_TYPES.HELP_UNAVAILABLE });
        await saveUnfinishedAnswer('error');
      } finally {
        reply.raw.end();
      }
    },
  );
};
