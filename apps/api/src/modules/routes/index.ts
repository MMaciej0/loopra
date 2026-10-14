import { routesRoutes } from './routes.js';
import type { FastifyInstance } from 'fastify';

export default async function routesModule(fastify: FastifyInstance) {
  fastify.register(routesRoutes);
}
