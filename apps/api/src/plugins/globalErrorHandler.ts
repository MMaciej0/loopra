import fastifyPlugin from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { BodyValidationError } from '../utils/validation.js';

export default fastifyPlugin((fastify: FastifyInstance) => {
  fastify.setErrorHandler((error, _request, reply) => {
    if (error instanceof BodyValidationError) {
      return reply.status(400).send(error.body);
    }
    throw error;
  });
});
