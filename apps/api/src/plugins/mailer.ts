import fastifyPlugin from 'fastify-plugin';
import { Resend } from 'resend';
import { RESEND_API_KEY } from '../config/env.js';

declare module 'fastify' {
  interface FastifyInstance {
    mailer: Resend;
  }
}

export default fastifyPlugin(async (fastify) => {
  const resend = new Resend(RESEND_API_KEY);

  fastify.decorate('mailer', resend);
});
