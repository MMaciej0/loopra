import { FastifyInstance } from 'fastify';
import { parseBody, parseSearchParams } from '../../utils/validation.js';
import { CreateEventBodySchema, ListEventsQuerySchema } from './schema.js';
import { listEvents } from './services/listEvents.js';
import { createEvent } from './services/createEvent.js';

export const eventsRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', async (request, reply) => {
    const searchParams = parseSearchParams(request.query, ListEventsQuerySchema);
    const { data, nextCursor } = await listEvents(fastify.db, searchParams);
    return reply.send({ data, nextCursor });
  });

  fastify.post('/', async (request, reply) => {
    const parsedBody = parseBody(request.body, CreateEventBodySchema);
    const creatorId = request.user.sub;
    const newEvent = await createEvent(fastify.db, creatorId, parsedBody);
    return reply.send({ data: newEvent });
  });
};
