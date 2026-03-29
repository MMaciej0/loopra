import { FastifyRequest } from 'fastify';
import z, { ZodType } from 'zod';
import { AppError, ErrorType } from './errors.js';

export const parseBody = <T>(body: FastifyRequest['body'], schema: ZodType<T>) => {
  const result = schema.safeParse(body);

  if (!result.success) {
    const tree = z.treeifyError(result.error);
    const properties = 'properties' in tree
      ? (tree.properties as Record<string, { errors: string[] }>)
      : undefined;
    const firstEntry = properties ? Object.entries(properties)[0] : undefined;
    const field = firstEntry?.[0];
    const message = firstEntry?.[1].errors[0] ?? 'Invalid input';
    throw new AppError(400, ErrorType.INVALID_INPUT, message, field);
  }

  return result.data;
};
