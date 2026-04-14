import Fastify from 'fastify';
import databasePlugin from './plugins/database.js';
import redisPlugin from './plugins/redis.js';
import authPlugin from './plugins/auth.js';
import mailerPlugin from './plugins/mailer.js';
import globalErrorHandler from './plugins/globalErrorHandler.js';

import authModule from './modules/auth/index.js';

export const buildApp = () => {
  const app = Fastify({
    logger: true,
  });

  app.register(databasePlugin);
  app.register(redisPlugin);
  app.register(authPlugin);
  app.register(mailerPlugin);

  app.register(globalErrorHandler);

  // public routes
  app.register(authModule, { prefix: '/auth' });
  app.get('/health', async () => {
    return { status: 'ok' };
  });

  // protected routes
  app.register(async (protectedApp) => {
    protectedApp.addHook('onRequest', protectedApp.authenticate);
  });

  return app;
};
