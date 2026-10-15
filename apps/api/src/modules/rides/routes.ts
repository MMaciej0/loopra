import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import {
  DownloadRouteResponseSchema,
  ListRideMarkersResponseSchema,
  ListRidesResponseSchema,
  RideDetailResponseSchema,
  RideParticipantResponseSchema,
  RideResponseSchema,
} from '@loopra/domain/schemas';
import {
  CreateRideBodySchema,
  ListMyRidesQuerySchema,
  ListRideMarkersQuerySchema,
  ListRidesQuerySchema,
  RideParamsSchema,
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
import { getRouteDownloadUrl } from './services/getRouteDownloadUrl.js';

export const ridesRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    '/',
    { schema: { querystring: ListRidesQuerySchema, response: { 200: ListRidesResponseSchema } } },
    async (request, reply) => {
      const { data, nextCursor } = await listRides(fastify.db, request.query);

      return reply.send({ data, nextCursor });
    },
  );

  fastify.get(
    '/markers',
    {
      schema: {
        querystring: ListRideMarkersQuerySchema,
        response: { 200: ListRideMarkersResponseSchema },
      },
    },
    async (request, reply) => {
      const markers = await listRideMarkers(fastify.db, request.query);

      return reply.send(markers);
    },
  );

  fastify.get(
    '/mine',
    { schema: { querystring: ListMyRidesQuerySchema, response: { 200: ListRidesResponseSchema } } },
    async (request, reply) => {
      const { data, nextCursor } = await listMyRides(fastify.db, request.user.sub, request.query);

      return reply.send({ data, nextCursor });
    },
  );

  fastify.post(
    '/',
    {
      preHandler: fastify.requireVerifiedEmail,
      schema: { body: CreateRideBodySchema, response: { 200: RideResponseSchema } },
    },
    async (request, reply) => {
      const newRide = await createRide(fastify.db, request.user.sub, request.body);

      return reply.send({ data: newRide });
    },
  );

  fastify.get(
    '/:id',
    { schema: { params: RideParamsSchema, response: { 200: RideDetailResponseSchema } } },
    async (request, reply) => {
      const { id } = request.params;
      const ride = await getRide(fastify.db, id);

      return reply.send({ data: ride });
    },
  );

  fastify.get(
    '/:id/route/download',
    { schema: { params: RideParamsSchema, response: { 200: DownloadRouteResponseSchema } } },
    async (request, reply) => {
      const { id } = request.params;
      const url = await getRouteDownloadUrl(fastify.db, fastify.s3, id);

      return reply.send({ data: { url } });
    },
  );

  fastify.patch(
    '/:id',
    {
      preHandler: fastify.requireVerifiedEmail,
      schema: {
        params: RideParamsSchema,
        body: UpdateRideBodySchema,
        response: { 200: RideResponseSchema },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const updatedRide = await updateRide(fastify.db, id, request.user.sub, request.body);

      return reply.send({ data: updatedRide });
    },
  );

  fastify.post(
    '/:id/cancel',
    {
      preHandler: fastify.requireVerifiedEmail,
      schema: { params: RideParamsSchema, response: { 200: RideResponseSchema } },
    },
    async (request, reply) => {
      const { id } = request.params;
      const cancelledRide = await cancelRide(fastify.db, id, request.user.sub);

      return reply.send({ data: cancelledRide });
    },
  );

  fastify.post(
    '/:id/join',
    {
      preHandler: fastify.requireVerifiedEmail,
      schema: { params: RideParamsSchema, response: { 200: RideParticipantResponseSchema } },
    },
    async (request, reply) => {
      const { id } = request.params;
      const newParticipant = await joinRide(fastify.db, request.user.sub, id);

      return reply.send({ data: newParticipant });
    },
  );

  fastify.delete(
    '/:id/leave',
    {
      preHandler: fastify.requireVerifiedEmail,
      schema: { params: RideParamsSchema, response: { 200: RideParticipantResponseSchema } },
    },
    async (request, reply) => {
      const { id } = request.params;
      const deleted = await leaveRide(fastify.db, request.user.sub, id);

      return reply.send({ data: deleted });
    },
  );
};
