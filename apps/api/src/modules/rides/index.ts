import { FastifyInstance } from 'fastify';
import { ridesRoutes } from './routes.js';

export default async function ridesModule(fastify: FastifyInstance) {
  fastify.register(ridesRoutes);
}
