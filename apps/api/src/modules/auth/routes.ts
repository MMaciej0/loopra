import { FastifyInstance } from 'fastify';
import { LoginBodySchema, RegisterBodySchema } from './schema.js';
import { registerUser, UserAlreadyExistsError } from './services/registerUser.js';
import { setAuthCookies } from './services/cookies.js';
import { parseBody } from '../../utils/validation.js';
import { InvalidPasswordError, loginUser, UserNotFoundError } from './services/loginUser.js';
import { AppError, ErrorType } from '../../utils/errors.js';

export const authRoutes = (fastify: FastifyInstance, _options: unknown) => {
  fastify.post('/register', async (request, reply) => {
    const { email, password } = parseBody(request.body, RegisterBodySchema);

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
        throw new AppError(409, ErrorType.USER_ALREADY_EXISTS, 'User already exists');
      }
      throw error;
    }
  });

  fastify.post('/login', async (request, reply) => {
    const { email, password } = parseBody(request.body, LoginBodySchema);

    try {
      const { familyUuid, rawRefreshToken, user } = await loginUser(
        fastify.db,
        fastify.redis,
        email,
        password,
      );

      const accessToken = fastify.jwt.sign({ sub: user.id });
      setAuthCookies(reply, accessToken, rawRefreshToken, familyUuid);
      return reply.send({ user: { id: user.id, email: user.email } });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new AppError(401, ErrorType.USER_NOT_FOUND, 'User not found');
      } else if (error instanceof InvalidPasswordError) {
        throw new AppError(401, ErrorType.INVALID_PASSWORD, 'Invalid password');
      }
      throw error;
    }
  });
};
