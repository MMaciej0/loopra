import { FastifyInstance } from 'fastify';
import {
  CreateFavoriteLocationResponseSchema,
  GetCurrentUserResponseSchema,
  ListFavoriteLocationsResponseSchema,
  UpdateCurrentUserResponseSchema,
  UpdateSelectedLocationResponseSchema,
} from '@loopra/domain/schemas';
import { parseBody } from '../../utils/validation.js';
import { LocationBodySchema, UpdateUserBodySchema } from './schema.js';
import { getCurrentUser } from './services/getCurrentUser.js';
import { updateUser } from './services/updateUser.js';
import { replaceSelectedLocation } from './services/replaceSelectedLocation.js';
import { listFavoriteLocations } from './services/listFavoriteLocations.js';
import { createFavoriteLocation } from './services/createFavoriteLocation.js';

export const usersRoutes = (fastify: FastifyInstance, _options: unknown) => {
  fastify.get(
    '/me',
    { schema: { response: { 200: GetCurrentUserResponseSchema } } },
    async (request, reply) => {
      const user = await getCurrentUser(fastify.db, request.user.sub);

      return reply.send({ user });
    },
  );

  fastify.patch(
    '/me',
    { schema: { response: { 200: UpdateCurrentUserResponseSchema } } },
    async (request, reply) => {
      const body = parseBody(request.body, UpdateUserBodySchema);
      const updatedUser = await updateUser(fastify.db, request.user.sub, body);

      return reply.send({ updatedUser });
    },
  );

  fastify.put(
    '/me/selected-location',
    { schema: { response: { 200: UpdateSelectedLocationResponseSchema } } },
    async (request, reply) => {
      const body = parseBody(request.body, LocationBodySchema);
      const selected_location = await replaceSelectedLocation(fastify.db, request.user.sub, body);

      return reply.send({ selected_location });
    },
  );

  fastify.get(
    '/me/favorite-locations',
    { schema: { response: { 200: ListFavoriteLocationsResponseSchema } } },
    async (request, reply) => {
      const favorite_locations = await listFavoriteLocations(fastify.db, request.user.sub);

      return reply.send({ favorite_locations });
    },
  );

  fastify.post(
    '/me/favorite-locations',
    { schema: { response: { 200: CreateFavoriteLocationResponseSchema } } },
    async (request, reply) => {
      const body = parseBody(request.body, LocationBodySchema);
      const favorite_location = await createFavoriteLocation(fastify.db, request.user.sub, body);

      return reply.send({ favorite_location });
    },
  );
};
