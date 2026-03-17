import { FastifyInstance } from 'fastify';
import { users } from '../db/schema.js';

const routes = (fastify: FastifyInstance, _options: unknown) => {
  fastify.get('/users', async (_request, reply) => {
    const result = await fastify.db.select().from(users);
    return reply.send(result);
  });
};

export default routes;
