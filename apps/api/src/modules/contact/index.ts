import { contactRoutes } from './routes.js';
import type { FastifyInstance } from 'fastify';

export default async function contactModule(fastify: FastifyInstance) {
  fastify.register(contactRoutes);
}
