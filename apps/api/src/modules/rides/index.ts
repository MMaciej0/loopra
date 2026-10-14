import { ridesRoutes } from './routes.js';
import type { FastifyInstance } from 'fastify';

export default async function ridesModule(fastify: FastifyInstance) {
  fastify.register(ridesRoutes);
}
