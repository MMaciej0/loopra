import fastifyPlugin from 'fastify-plugin';
import { Redis } from 'ioredis';
import { REDIS_URL } from '../config/env.js';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

export default fastifyPlugin(async (fastify) => {
  const redis = new Redis(REDIS_URL);

  fastify.decorate('redis', redis);

  fastify.addHook('onClose', async () => {
    await redis.quit();
  });
});
