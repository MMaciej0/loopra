import { FastifyInstance } from 'fastify';
import { routesRoutes } from './routes.js';

export default async function routesModule(fastify: FastifyInstance) {
  fastify.register(routesRoutes);
}
