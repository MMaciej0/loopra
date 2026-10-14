import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { usersRoutes } from './routes.js';
import type { FastifyInstance } from 'fastify';

export default async function usersModule(fastify: FastifyInstance) {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);
  fastify.register(usersRoutes);
}
