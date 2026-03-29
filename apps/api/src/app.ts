import Fastify from 'fastify';
import databasePlugin from './plugins/database.js';
import redisPlugin from './plugins/redis.js';
import authPlugin from './plugins/auth.js';
import globalErrorHandler from './plugins/globalErrorHandler.js';

import authModule from './modules/auth/index.js';

export const buildApp = () => {
  const app = Fastify({
    logger: true,
  });

  app.register(databasePlugin);
  app.register(redisPlugin);
  app.register(authPlugin);

  app.register(globalErrorHandler);

  app.register(authModule, { prefix: '/auth' });

  app.get('/health', async () => {
    return { status: 'ok' };
  });

  return app;
};
