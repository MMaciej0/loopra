import { FastifyInstance } from 'fastify';
import {
  GetCurrentUserResponseSchema,
  UpdateCurrentUserResponseSchema,
} from '@loopra/domain/schemas';
import { parseBody } from '../../utils/validation.js';
import { UpdateUserBodySchema } from './schema.js';
import { getCurrentUser } from './services/getCurrentUser.js';
import { updateUser } from './services/updateUser.js';

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
};
