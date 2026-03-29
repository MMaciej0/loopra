import { FastifyRequest } from 'fastify';
import z, { ZodType } from 'zod';

export class BodyValidationError extends Error {
  statusCode = 400;
  constructor(public readonly body: Record<string, unknown>) {
    super('Invalid request body');
  }
}

export const parseBody = <T>(body: FastifyRequest['body'], schema: ZodType<T>) => {
  const result = schema.safeParse(body);

  if (!result.success) {
    throw new BodyValidationError(z.treeifyError(result.error));
  }

  return result.data;
};
