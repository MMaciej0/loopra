import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import {
  ListRideMarkersResponseSchema,
  ListRidesResponseSchema,
  RideDetailResponseSchema,
  RideParticipantResponseSchema,
  RideResponseSchema,
} from '@loopra/domain/schemas';
import { parseBody, parseSearchParams } from '../../utils/validation.js';
import {
  CreateRideBodySchema,
  ListMyRidesQuerySchema,
  ListRideMarkersQuerySchema,
  ListRidesQuerySchema,
  UpdateRideBodySchema,
} from './schema.js';
import { listRides } from './services/listRides.js';
import { listMyRides } from './services/listMyRides.js';
import { listRideMarkers } from './services/listRideMarkers.js';
import { createRide } from './services/createRide.js';
import { updateRide } from './services/updateRide.js';
import { cancelRide } from './services/cancelRide.js';
import { joinRide } from './services/joinRide.js';
import { leaveRide } from './services/leaveRide.js';
import { getRide } from './services/getRide.js';

export const ridesRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    '/',
    { schema: { response: { 200: ListRidesResponseSchema } } },
    async (request, reply) => {
      const searchParams = parseSearchParams(request.query, ListRidesQuerySchema);
      const { data, nextCursor } = await listRides(fastify.db, searchParams);

      return reply.send({ data, nextCursor });
    },
  );

  fastify.get(
    '/markers',
    { schema: { response: { 200: ListRideMarkersResponseSchema } } },
    async (request, reply) => {
      const searchParams = parseSearchParams(request.query, ListRideMarkersQuerySchema);
      const markers = await listRideMarkers(fastify.db, searchParams);

      return reply.send(markers);
    },
  );

  fastify.get(
    '/mine',
    { schema: { response: { 200: ListRidesResponseSchema } } },
    async (request, reply) => {
      const searchParams = parseSearchParams(request.query, ListMyRidesQuerySchema);
      const { data, nextCursor } = await listMyRides(fastify.db, request.user.sub, searchParams);

      return reply.send({ data, nextCursor });
    },
  );

  fastify.post(
    '/',
    {
      preHandler: fastify.requireVerifiedEmail,
      schema: { response: { 200: RideResponseSchema } },
    },
    async (request, reply) => {
      const parsedBody = parseBody(request.body, CreateRideBodySchema);
      const newRide = await createRide(fastify.db, request.user.sub, parsedBody);

      return reply.send({ data: newRide });
    },
  );

  fastify.get(
    '/:id',
    { schema: { response: { 200: RideDetailResponseSchema } } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const ride = await getRide(fastify.db, id);

      return reply.send({ data: ride });
    },
  );

  fastify.patch(
    '/:id',
    {
      preHandler: fastify.requireVerifiedEmail,
      schema: { response: { 200: RideResponseSchema } },
    },
    async (request, reply) => {
      const parsedBody = parseBody(request.body, UpdateRideBodySchema);
      const { id } = request.params as { id: string };
      const updatedRide = await updateRide(fastify.db, id, request.user.sub, parsedBody);

      return reply.send({ data: updatedRide });
    },
  );

  fastify.post(
    '/:id/cancel',
    {
      preHandler: fastify.requireVerifiedEmail,
      schema: { response: { 200: RideResponseSchema } },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const cancelledRide = await cancelRide(fastify.db, id, request.user.sub);

      return reply.send({ data: cancelledRide });
    },
  );

  fastify.post(
    '/:id/join',
    {
      preHandler: fastify.requireVerifiedEmail,
      schema: { response: { 200: RideParticipantResponseSchema } },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const newParticipant = await joinRide(fastify.db, request.user.sub, id);

      return reply.send({ data: newParticipant });
    },
  );

  fastify.delete(
    '/:id/leave',
    {
      preHandler: fastify.requireVerifiedEmail,
      schema: { response: { 200: RideParticipantResponseSchema } },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const deleted = await leaveRide(fastify.db, request.user.sub, id);

      return reply.send({ data: deleted });
    },
  );
};
