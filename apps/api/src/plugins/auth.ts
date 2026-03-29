import fastifyPlugin from 'fastify-plugin';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import { JWT_ACCESS_SECRET } from '../config/env.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
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
  });

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    await request.jwtVerify();
  });
});
