import { authRoutes } from './routes.js';
import type { FastifyInstance } from 'fastify';

export default async function authModule(fastify: FastifyInstance) {
  fastify.register(authRoutes);
}
