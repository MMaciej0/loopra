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

        const finalMessage = await stream.finalMessage();
        request.log.info({ usage: finalMessage.usage }, 'help answer done');

        writeEvent<HelpDoneEvent>(reply, 'done', {
          answerId: crypto.randomUUID(),
          topic: null,
          fallback: false,
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
