import { helpRoutes } from './routes.js';
import type { FastifyInstance } from 'fastify';

export default async function helpModule(fastify: FastifyInstance) {
  fastify.register(helpRoutes);
}
