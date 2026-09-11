import { FastifyRequest } from 'fastify';
import z, { ZodType } from 'zod';
import { ERROR_TYPES } from '@loopra/domain';
import { AppError } from './errors.js';

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
    throw new AppError(400, ERROR_TYPES.INVALID_INPUT, message, field);
  }

  return result.data;
};

export const parseSearchParams = <T>(query: FastifyRequest['query'], schema: ZodType<T>) => {
  const result = schema.safeParse(query);

  if (!result.success) {
    const tree = z.treeifyError(result.error);
    const properties = 'properties' in tree
      ? (tree.properties as Record<string, { errors: string[] }>)
      : undefined;
    const firstEntry = properties ? Object.entries(properties)[0] : undefined;
    const field = firstEntry?.[0];
    const message = firstEntry?.[1].errors[0] ?? 'Invalid query param';
    throw new AppError(400, ERROR_TYPES.INVALID_INPUT, message, field);
  }

  return result.data;
};
