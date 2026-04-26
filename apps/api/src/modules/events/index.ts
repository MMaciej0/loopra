import { FastifyInstance } from 'fastify';
import { eventsRoutes } from './routes.js';

export default async function eventsModule(fastify: FastifyInstance) {
  fastify.register(eventsRoutes);
}
