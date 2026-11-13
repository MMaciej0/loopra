import { HelpMessageBodySchema } from '@loopra/domain/schemas';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { askHelp } from './services/ask.js';
import { writeEvent } from '../../utils/serverEvent.js';
import {
  ERROR_TYPES,
  type HelpDoneEvent,
  type HelpErrorEvent,
  type HelpTextEvent,
} from '@loopra/domain';
import { APIUserAbortError } from '@anthropic-ai/sdk';
import { ReportAnswerInputSchema } from './schema.js';

export const helpRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    '/ask',
    {
      schema: {
        body: HelpMessageBodySchema,
      },
    },
    async (request, reply) => {
      const stream = askHelp(fastify.anthropic, request.body);

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
            writeEvent<HelpTextEvent>(reply, 'text', { text: event.delta.text });
          }
        }

        const { content, usage } = await stream.finalMessage();

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

        writeEvent<HelpDoneEvent>(reply, 'done', {
          answerId: crypto.randomUUID(),
          topic,
          fallback,
        });
      } catch (error) {
        if (error instanceof APIUserAbortError) {
          request.log.info('User aborted help stream');
          return;
        }

        request.log.error(error);
        writeEvent<HelpErrorEvent>(reply, 'error', { type: ERROR_TYPES.HELP_UNAVAILABLE });
      } finally {
        reply.raw.end();
      }
    },
  );
};
