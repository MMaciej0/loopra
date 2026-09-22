import { FastifyInstance } from 'fastify';
import {
  GetCurrentUserResponseSchema,
  UpdateCurrentUserResponseSchema,
  UpdateSelectedLocationResponseSchema,
} from '@loopra/domain/schemas';
import { parseBody } from '../../utils/validation.js';
import { ReplaceSelectedLocationBodySchema, UpdateUserBodySchema } from './schema.js';
import { getCurrentUser } from './services/getCurrentUser.js';
import { updateUser } from './services/updateUser.js';
import { replaceSelectedLocation } from './services/replaceSelectedLocation.js';

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
      const body = parseBody(request.body, ReplaceSelectedLocationBodySchema);
      const selected_location = await replaceSelectedLocation(fastify.db, request.user.sub, body);

      return reply.send({ selected_location });
    },
  );
};
