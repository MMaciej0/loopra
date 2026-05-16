import { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { users } from '../../db/schema.js';
import { AppError, ErrorType } from '../../utils/errors.js';

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
      },
    });

    if (!user) {
      throw new AppError(404, ErrorType.USER_NOT_FOUND, 'User not found');
    }

    return reply.send({ user });
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
      throw new AppError(404, ErrorType.USER_NOT_FOUND, 'User not found');
    }

    return reply.send({ user });
  });
};
