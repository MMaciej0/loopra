import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { CreateRouteResponseSchema } from '@loopra/domain/schemas';
import { createRoute } from './services/createRoute.js';
import { FileRequiredError } from './errors.js';

export const routesRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    '/',
    {
      preHandler: fastify.requireVerifiedEmail,
      schema: { response: { 201: CreateRouteResponseSchema } },
    },
    async (request, reply) => {
      const data = await request.file();

      if (!data) {
        throw new FileRequiredError();
      }

      const buffer = await data.toBuffer();
      const newRoute = await createRoute(
        fastify.db,
        fastify.s3,
        buffer,
        request.user.sub,
        data.filename,
      );

      return reply.status(201).send({ data: newRoute });
    },
  );
};
