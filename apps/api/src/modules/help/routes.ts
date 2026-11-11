import { HelpMessageBodySchema } from '@loopra/domain/schemas';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { askHelp } from './services/ask.js';

export const helpRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    '/ask',
    {
      schema: {
        body: HelpMessageBodySchema,
      },
    },
    async (request, reply) => {
      const answer = await askHelp(fastify.anthropic, request.body);

      reply.send(answer);
    },
  );
};
