import fastifyPlugin from 'fastify-plugin';
import { FastifyError, FastifyInstance } from 'fastify';
import {
  hasZodFastifySchemaValidationErrors,
  ResponseSerializationError,
} from 'fastify-type-provider-zod';
import { ERROR_TYPES, isErrorType } from '@loopra/domain';
import { AppError } from '../utils/errors.js';

const toAppError = (error: unknown) => {
  if (error instanceof AppError || !hasZodFastifySchemaValidationErrors(error)) {
    return error;
  }

  const [issue] = error.validation;
  const field = issue.instancePath.split('/')[1] || undefined;

  if ((error as FastifyError).validationContext === 'params' && isErrorType(issue.message)) {
    return new AppError(404, issue.message, 'Not found');
  }

  return new AppError(400, ERROR_TYPES.INVALID_INPUT, issue.message ?? 'Invalid input', field);
};

export default fastifyPlugin((fastify: FastifyInstance) => {
  fastify.setErrorHandler((rawError, _request, reply) => {
    const error = toAppError(rawError);

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

    if (error instanceof ResponseSerializationError) {
      fastify.log.error(
        { method: error.method, url: error.url, issues: error.cause.issues },
        error.message,
      );
    } else {
      fastify.log.error(error);
    }

    return reply
      .status(500)
      .send({ type: ERROR_TYPES.INTERNAL_ERROR, message: 'Internal server error' });
  });
});
