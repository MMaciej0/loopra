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

    if (
      error instanceof fastify.multipartErrors.RequestFileTooLargeError ||
      error instanceof fastify.multipartErrors.FieldsLimitError ||
      error instanceof fastify.multipartErrors.FilesLimitError ||
      error instanceof fastify.multipartErrors.PartsLimitError
    ) {
      return reply.status(413).send({
        type: ErrorType.FILE_TOO_LARGE,
        message: 'File too large',
      });
    }

    fastify.log.error(error);
    return reply
      .status(500)
      .send({ type: ErrorType.INTERNAL_ERROR, message: 'Internal server error' });
  });
});
