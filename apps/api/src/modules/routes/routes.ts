import { FastifyInstance } from 'fastify';
import { AppError, ErrorType } from '../../utils/errors.js';
import { createRoute } from './services/createRoute.js';
import { InvalidGpxError } from './errors.js';

export const routesRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/', { preHandler: fastify.requireVerifiedEmail }, async (request, reply) => {
    const userId = request.user.sub;

    const data = await request.file();

    if (!data) {
      throw new AppError(400, ErrorType.FILE_REQUIRED, 'File is required');
    }

    const buffer = await data.toBuffer();

    try {
      const [newRoute] = await createRoute(fastify.db, fastify.s3, buffer, userId, data.filename);
      return reply.status(201).send({ data: newRoute });
    } catch (error) {
      if (error instanceof InvalidGpxError) {
        throw new AppError(400, ErrorType.INVALID_GPX, 'Invalid GPX file');
      }
      throw error;
    }
  });
};
