import fastifyPlugin from 'fastify-plugin';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import { JWT_ACCESS_SECRET } from '../config/env.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError, ErrorType } from '../utils/errors.js';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireVerifiedEmail: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; email_verified: boolean };
    user: { sub: string; email_verified: boolean };
  }
}

export default fastifyPlugin(async (fastify) => {
  fastify.register(fastifyCookie);

  fastify.register(fastifyJwt, {
    secret: JWT_ACCESS_SECRET,
    cookie: {
      cookieName: 'accessToken',
      signed: false,
    },
    sign: {
      expiresIn: '15m',
    },
  });

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      throw new AppError(401, ErrorType.STALE_TOKEN, 'Stale token');
    }
  });

  fastify.decorate('requireVerifiedEmail', async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user.email_verified) {
      throw new AppError(403, ErrorType.EMAIL_NOT_VERIFIED, 'Email not verified');
    }
  });
});
