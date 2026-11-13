import { HelpMessageBodySchema } from '@loopra/domain/schemas';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { askHelp, HELP_MODEL } from './services/ask.js';
import { openEventStream } from '../../utils/serverEvent.js';
import {
  ERROR_TYPES,
  type HelpDoneEvent,
  type HelpErrorEvent,
  type HelpTextEvent,
} from '@loopra/domain';
import { APIUserAbortError } from '@anthropic-ai/sdk';
import { APP_ENV } from '../../config/env.js';
import { startHelpAnswer } from './services/startHelpAnswer.js';

export const helpRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    '/ask',
    {
      schema: {
        body: HelpMessageBodySchema,
      },
    },
    async (request, reply) => {
      const record = startHelpAnswer(
        { db: fastify.db, log: request.log },
        request.body,
        APP_ENV,
        HELP_MODEL,
      );
      const stream = askHelp(fastify.anthropic, request.body);
      const events = openEventStream(reply, () => stream.abort());

      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            record.addText(event.delta.text);
            events.send<HelpTextEvent>('text', { text: event.delta.text });
          }
        }

        const done = await record.saveCompletedAnswer(await stream.finalMessage());

        events.send<HelpDoneEvent>('done', done);
      } catch (error) {
        if (error instanceof APIUserAbortError) {
          request.log.info('User aborted help stream');
          await record.saveUnfinishedAnswer('aborted');
          return;
        }

        request.log.error(error);
        events.send<HelpErrorEvent>('error', { type: ERROR_TYPES.HELP_UNAVAILABLE });
        await record.saveUnfinishedAnswer('error');
      } finally {
        events.end();
      }
    },
  );
};
