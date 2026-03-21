import Fastify from 'fastify';
import databasePlugin from './plugins/database.js';
import redisPlugin from './plugins/redis.js';
import userRoutes from './routes/users.js';

export const buildApp = () => {
  const app = Fastify({
    logger: true,
  });

  app.register(databasePlugin);
  app.register(redisPlugin);

  app.register(userRoutes);

  app.get('/health', async () => {
    return { status: 'ok' };
  });

  return app;
};
