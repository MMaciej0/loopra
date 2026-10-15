import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HealthResponseSchema } from './schema.js';
import { checkHealth } from './services/checkHealth.js';

export const healthRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    '/',
    { schema: { response: { 200: HealthResponseSchema, 503: HealthResponseSchema } } },
    async (_request, reply) => {
      const health = await checkHealth(fastify.db, fastify.redis);

      return reply.code(health.status === 'ok' ? 200 : 503).send(health);
    },
  );
};
