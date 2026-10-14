import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { authRoutes } from './routes.js';
import type { FastifyInstance } from 'fastify';

export default async function authModule(fastify: FastifyInstance) {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);
  fastify.register(authRoutes);
}
