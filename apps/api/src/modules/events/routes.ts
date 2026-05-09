import { FastifyInstance } from 'fastify';
import { parseBody, parseSearchParams } from '../../utils/validation.js';
import { CreateEventBodySchema, ListEventsQuerySchema, UpdateEventBodySchema } from './schema.js';
import { listEvents } from './services/listEvents.js';
import { createEvent } from './services/createEvent.js';
import { updateEvent } from './services/updateEvent.js';
import { deleteEvent } from './services/deleteEvent.js';
import {
  EventNotFoundError,
  EventUpdateBadBodyError,
  EventHasParticipantsError,
  ParticipantExistsError,
  MaxParticipantsError,
  ParticipantNotFoundError,
} from './errors.js';
import { AppError, ErrorType } from '../../utils/errors.js';
import { joinEvent } from './services/joinEvent.js';
import { leaveEvent } from './services/leaveEvent.js';
import { getEvent } from './services/getEvent.js';

export const eventsRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', async (request, reply) => {
    const searchParams = parseSearchParams(request.query, ListEventsQuerySchema);
    const { data, nextCursor } = await listEvents(fastify.db, searchParams);
    return reply.send({ data, nextCursor });
  });

  fastify.post('/', async (request, reply) => {
    const parsedBody = parseBody(request.body, CreateEventBodySchema);
    const creatorId = request.user.sub;
    const [newEvent] = await createEvent(fastify.db, creatorId, parsedBody);
    return reply.send({ data: newEvent });
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const event = await getEvent(fastify.db, id);
      return reply.send({ data: event });
    } catch (error) {
      if (error instanceof EventNotFoundError) {
        throw new AppError(404, ErrorType.EVENT_NOT_FOUND, 'Event not found');
      }
      throw error;
    }
  });

  fastify.patch('/:id', async (request, reply) => {
    const parsedBody = parseBody(request.body, UpdateEventBodySchema);
    const { id } = request.params as { id: string };
    const creatorId = request.user.sub;
    try {
      const updatedEvent = await updateEvent(fastify.db, id, creatorId, parsedBody);
      return reply.send({ data: updatedEvent });
    } catch (error) {
      if (error instanceof EventNotFoundError) {
        throw new AppError(404, ErrorType.EVENT_NOT_FOUND, 'Event not found');
      }
      if (error instanceof EventUpdateBadBodyError) {
        throw new AppError(400, ErrorType.EVENT_UPDATE_BAD_BODY, error.message);
      }
      throw error;
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const creatorId = request.user.sub;
    try {
      const deletedEvent = await deleteEvent(fastify.db, id, creatorId);
      return reply.send({ data: deletedEvent });
    } catch (error) {
      if (error instanceof EventNotFoundError) {
        throw new AppError(404, ErrorType.EVENT_NOT_FOUND, 'Event not found');
      }
      if (error instanceof EventHasParticipantsError) {
        throw new AppError(400, ErrorType.EVENT_HAS_PARTICIPANTS, 'Event has participants');
      }
      throw error;
    }
  });

  fastify.post('/:id/join', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.sub;
    try {
      const newParticipant = await joinEvent(fastify.db, userId, id);
      return reply.send({ data: newParticipant });
    } catch (error) {
      if (error instanceof EventNotFoundError) {
        throw new AppError(404, ErrorType.EVENT_NOT_FOUND, 'Event not found');
      }
      if (error instanceof ParticipantExistsError) {
        throw new AppError(400, ErrorType.PARTICIPANT_EXISTS, 'Participant already exists');
      }
      if (error instanceof MaxParticipantsError) {
        throw new AppError(400, ErrorType.MAX_PARTICIPANTS, 'Max participants reached');
      }
      throw error;
    }
  });

  fastify.delete('/:id/leave', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.sub;
    try {
      const deleted = await leaveEvent(fastify.db, userId, id);
      return reply.send({ data: deleted });
    } catch (error) {
      if (error instanceof ParticipantNotFoundError) {
        throw new AppError(404, ErrorType.PARTICIPANT_NOT_FOUND, 'Participant not found');
      }
      throw error;
    }
  });
};
