import { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { users } from '../../db/schema.js';
import { ERROR_TYPES } from '@loopra/domain';
import { AppError } from '../../utils/errors.js';
import { parseBody } from '../../utils/validation.js';
import { UpdateUserBodySchema } from './schema.js';
import { updateUser } from './services/updateUser.js';
import { UserNotFoundError } from './errors.js';

export const usersRoutes = (fastify: FastifyInstance, _options: unknown) => {
  fastify.get('/me', async (request, reply) => {
    const userId = request.user.sub;

    const user = await fastify.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        email: true,
        created_at: true,
        email_verified: true,
        favorite_city: true,
        favorite_country: true,
        favorite_location: true,
        favorite_municipality: true,
        favorite_postal_code: true,
        favorite_region: true,
        location_prompt_dismissed_at: true,
      },
    });

    if (!user) {
      throw new AppError(404, ERROR_TYPES.USER_NOT_FOUND, 'User not found');
    }

    return reply.send({ user });
  });

  fastify.patch('/me', async (request, reply) => {
    const userId = request.user.sub;
    const body = parseBody(request.body, UpdateUserBodySchema);

    try {
      const updatedUser = await updateUser(fastify.db, userId, body);
      return reply.send({ updatedUser });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new AppError(404, ERROR_TYPES.USER_NOT_FOUND, 'User not found');
      }
      throw error;
    }
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const user = await fastify.db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true,
        email: true,
        created_at: true,
        email_verified: true,
      },
    });

    if (!user) {
      throw new AppError(404, ERROR_TYPES.USER_NOT_FOUND, 'User not found');
    }

    return reply.send({ user });
  });
};
