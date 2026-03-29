import fastifyPlugin from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { AppError, ErrorType } from '../utils/errors.js';

export default fastifyPlugin((fastify: FastifyInstance) => {
  fastify.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        type: error.type,
        message: error.message,
        ...(error.field !== undefined ? { field: error.field } : {}),
      });
    }

    fastify.log.error(error);
    return reply.status(500).send({ type: ErrorType.INTERNAL_ERROR, message: 'Internal server error' });
  });
});
