import { healthRoutes } from './routes.js';
import type { FastifyInstance } from 'fastify';

export default async function healthModule(fastify: FastifyInstance) {
  fastify.register(healthRoutes);
}
