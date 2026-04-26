import { FastifyInstance } from 'fastify';
import { parseSearchParams } from '../../utils/validation.js';
import { ListEventsQuerySchema } from './schema.js';
import { listEvents } from './services/listEvents.js';

export const eventsRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', async (request, reply) => {
    const searchParams = parseSearchParams(request.query, ListEventsQuerySchema);
    const { data, nextCursor } = await listEvents(fastify.db, searchParams);
    return reply.send({ data, nextCursor });
  });
};
