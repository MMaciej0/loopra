import Fastify from 'fastify';
import databasePlugin from './plugins/database.js';
import userRoutes from './routes/users.js';

export const buildApp = () => {
  const app = Fastify({
    logger: true,
  });

  app.register(databasePlugin);

  app.register(userRoutes);

  app.get('/health', async () => {
    return { status: 'ok' };
  });

  return app;
};
