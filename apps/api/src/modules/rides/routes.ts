import { FastifyInstance } from 'fastify';
import { parseBody, parseSearchParams } from '../../utils/validation.js';
import { CreateRideBodySchema, ListRidesQuerySchema, UpdateRideBodySchema } from './schema.js';
import { listRides } from './services/listRides.js';
import { createRide } from './services/createRide.js';
import { updateRide } from './services/updateRide.js';
import { deleteRide } from './services/deleteRide.js';
import {
  RideNotFoundError,
  RideUpdateBadBodyError,
  RideHasParticipantsError,
  ParticipantExistsError,
  MaxParticipantsError,
  ParticipantNotFoundError,
  CreatorCannotLeaveError,
  RouteNotFoundError,
} from './errors.js';
import { AppError, ErrorType } from '../../utils/errors.js';
import { joinRide } from './services/joinRide.js';
import { leaveRide } from './services/leaveRide.js';
import { getRide } from './services/getRide.js';

export const ridesRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', async (request, reply) => {
    const searchParams = parseSearchParams(request.query, ListRidesQuerySchema);
    const { data, nextCursor } = await listRides(fastify.db, searchParams);
    return reply.send({ data, nextCursor });
  });

  fastify.post('/', { preHandler: fastify.requireVerifiedEmail }, async (request, reply) => {
    const parsedBody = parseBody(request.body, CreateRideBodySchema);
    const creatorId = request.user.sub;

    try {
      const [newRide] = await createRide(fastify.db, creatorId, parsedBody);
      return reply.send({ data: newRide });
    } catch (error) {
      if (error instanceof RouteNotFoundError) {
        throw new AppError(404, ErrorType.ROUTE_NOT_FOUND, 'Route not found');
      }
      throw error;
    }
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const ride = await getRide(fastify.db, id);
      return reply.send({ data: ride });
    } catch (error) {
      if (error instanceof RideNotFoundError) {
        throw new AppError(404, ErrorType.RIDE_NOT_FOUND, 'Ride not found');
      }
      throw error;
    }
  });

  fastify.patch('/:id', { preHandler: fastify.requireVerifiedEmail }, async (request, reply) => {
    const parsedBody = parseBody(request.body, UpdateRideBodySchema);
    const { id } = request.params as { id: string };
    const creatorId = request.user.sub;
    try {
      const updatedRide = await updateRide(fastify.db, id, creatorId, parsedBody);
      return reply.send({ data: updatedRide });
    } catch (error) {
      if (error instanceof RideNotFoundError) {
        throw new AppError(404, ErrorType.RIDE_NOT_FOUND, 'Ride not found');
      }
      if (error instanceof RideUpdateBadBodyError) {
        throw new AppError(400, ErrorType.RIDE_UPDATE_BAD_BODY, error.message);
      }
      throw error;
    }
  });

  fastify.delete('/:id', { preHandler: fastify.requireVerifiedEmail }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const creatorId = request.user.sub;
    try {
      const deletedRide = await deleteRide(fastify.db, id, creatorId);
      return reply.send({ data: deletedRide });
    } catch (error) {
      if (error instanceof RideNotFoundError) {
        throw new AppError(404, ErrorType.RIDE_NOT_FOUND, 'Ride not found');
      }
      if (error instanceof RideHasParticipantsError) {
        throw new AppError(400, ErrorType.RIDE_HAS_PARTICIPANTS, 'Ride has participants');
      }
      throw error;
    }
  });

  fastify.post('/:id/join', { preHandler: fastify.requireVerifiedEmail }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.sub;
    try {
      const newParticipant = await joinRide(fastify.db, userId, id);
      return reply.send({ data: newParticipant });
    } catch (error) {
      if (error instanceof RideNotFoundError) {
        throw new AppError(404, ErrorType.RIDE_NOT_FOUND, 'Ride not found');
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

  fastify.delete('/:id/leave', { preHandler: fastify.requireVerifiedEmail }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.sub;
    try {
      const deleted = await leaveRide(fastify.db, userId, id);
      return reply.send({ data: deleted });
    } catch (error) {
      if (error instanceof ParticipantNotFoundError) {
        throw new AppError(404, ErrorType.PARTICIPANT_NOT_FOUND, 'Participant not found');
      }
      if (error instanceof CreatorCannotLeaveError) {
        throw new AppError(400, ErrorType.CREATOR_CANNOT_LEAVE, 'Creator cannot leave own ride');
      }
      throw error;
    }
  });
};
