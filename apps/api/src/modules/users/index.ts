import { usersRoutes } from './routes.js';
import type { FastifyInstance } from 'fastify';

export default async function usersModule(fastify: FastifyInstance) {
  fastify.register(usersRoutes);
}
