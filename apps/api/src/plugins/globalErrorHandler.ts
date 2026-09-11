import fastifyPlugin from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { ERROR_TYPES } from '@loopra/domain';
import { AppError } from '../utils/errors.js';

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
        type: ERROR_TYPES.FILE_TOO_LARGE,
        message: 'File too large',
      });
    }

    if (error instanceof fastify.multipartErrors.InvalidMultipartContentTypeError) {
      return reply.status(400).send({
        type: ERROR_TYPES.FILE_REQUIRED,
        message: 'File is required',
      });
    }

    fastify.log.error(error);
    return reply
      .status(500)
      .send({ type: ERROR_TYPES.INTERNAL_ERROR, message: 'Internal server error' });
  });
});
