import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { ridesRoutes } from './routes.js';
import type { FastifyInstance } from 'fastify';

export default async function ridesModule(fastify: FastifyInstance) {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);
  fastify.register(ridesRoutes);
}
