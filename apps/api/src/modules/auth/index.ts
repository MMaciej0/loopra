import { authRoutes } from './routes.js';
import type { FastifyInstance } from 'fastify';
import type { AppEnv } from '@loopra/domain';

export default async function authModule(fastify: FastifyInstance, { appEnv }: { appEnv: AppEnv }) {
  fastify.register(authRoutes, { appEnv });
}
