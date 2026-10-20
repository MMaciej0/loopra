import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { ContactMessageBodySchema, MessageResponseSchema } from '@loopra/domain/schemas';
import { contactRateLimiter } from './services/rateLimiter.js';
import { sendContactMessage } from './services/sendContactMessage.js';

export const contactRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    '/',
    { schema: { body: ContactMessageBodySchema, response: { 200: MessageResponseSchema } } },
    async (request, reply) => {
      await contactRateLimiter(request, fastify.redis);

      await sendContactMessage(request.body, fastify.mailer);

      return reply.send({ message: 'Message sent' });
    },
  );
};
