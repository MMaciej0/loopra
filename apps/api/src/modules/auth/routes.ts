import z from 'zod';
import { FastifyInstance } from 'fastify';
import { RegisterBodySchema } from './schema.js';
import { registerUser, UserAlreadyExistsError } from './services/registerUser.js';
import { setAuthCookies } from './services/cookies.js';

export const authRoutes = (fastify: FastifyInstance, _options: unknown) => {
  fastify.post('/register', async (request, reply) => {
    const result = RegisterBodySchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: z.treeifyError(result.error) });
    }

    const { email, password } = result.data;

    try {
      const { familyUuid, rawRefreshToken, user } = await registerUser(
        fastify.db,
        fastify.redis,
        email,
        password,
      );
      const accessToken = fastify.jwt.sign({ sub: user.id });
      setAuthCookies(reply, accessToken, rawRefreshToken, familyUuid);
      return reply.send({ user: { id: user.id, email: user.email } });
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        return reply.status(409).send({ error: 'User already exists' });
      }
      throw error;
    }
  });
};
