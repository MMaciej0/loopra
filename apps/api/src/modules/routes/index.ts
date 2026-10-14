import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { routesRoutes } from './routes.js';
import type { FastifyInstance } from 'fastify';

export default async function routesModule(fastify: FastifyInstance) {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);
  fastify.register(routesRoutes);
}
