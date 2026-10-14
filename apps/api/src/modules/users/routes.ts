import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import {
  FavoriteLocationResponseSchema,
  GetCurrentUserResponseSchema,
  ListFavoriteLocationsResponseSchema,
  UpdateCurrentUserResponseSchema,
  UpdateSelectedLocationResponseSchema,
} from '@loopra/domain/schemas';
import {
  FavoriteLocationParamsSchema,
  LocationBodySchema,
  UpdateUserBodySchema,
} from './schema.js';
import { getCurrentUser } from './services/getCurrentUser.js';
import { updateUser } from './services/updateUser.js';
import { replaceSelectedLocation } from './services/replaceSelectedLocation.js';
import { listFavoriteLocations } from './services/listFavoriteLocations.js';
import { createFavoriteLocation } from './services/createFavoriteLocation.js';
import { deleteFavoriteLocation } from './services/deleteFavoriteLocation.js';

export const usersRoutes: FastifyPluginAsyncZod = async (fastify) => {
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
    { schema: { body: UpdateUserBodySchema, response: { 200: UpdateCurrentUserResponseSchema } } },
    async (request, reply) => {
      const updatedUser = await updateUser(fastify.db, request.user.sub, request.body);

      return reply.send({ updatedUser });
    },
  );

  fastify.put(
    '/me/selected-location',
    {
      schema: { body: LocationBodySchema, response: { 200: UpdateSelectedLocationResponseSchema } },
    },
    async (request, reply) => {
      const selected_location = await replaceSelectedLocation(
        fastify.db,
        request.user.sub,
        request.body,
      );

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
    { schema: { body: LocationBodySchema, response: { 200: FavoriteLocationResponseSchema } } },
    async (request, reply) => {
      const favorite_location = await createFavoriteLocation(
        fastify.db,
        request.user.sub,
        request.body,
      );

      return reply.send({ favorite_location });
    },
  );

  fastify.delete(
    '/me/favorite-locations/:id',
    {
      schema: {
        params: FavoriteLocationParamsSchema,
        response: { 200: FavoriteLocationResponseSchema },
      },
    },
    async (request, reply) => {
      const favorite_location = await deleteFavoriteLocation(
        fastify.db,
        request.user.sub,
        request.params.id,
      );

      return reply.send({ favorite_location });
    },
  );
};
