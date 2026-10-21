import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import type { AppEnv } from '@loopra/domain';
import { APP_ENV, TRUSTED_PROXIES } from './config/env.js';
import databasePlugin from './plugins/database.js';
import redisPlugin from './plugins/redis.js';
import authPlugin from './plugins/auth.js';
import oauthPlugin from './plugins/oauth.js';
import mailerPlugin from './plugins/mailer.js';
import corsPlugin from './plugins/cors.js';
import storagePlugin from './plugins/storage.js';
import globalErrorHandler from './plugins/globalErrorHandler.js';
import multipartPlugin from './plugins/multipart.js';

import authModule from './modules/auth/index.js';
import healthModule from './modules/health/index.js';
import contactModule from './modules/contact/index.js';
import usersModule from './modules/users/index.js';
import ridesModule from './modules/rides/index.js';
import routesModule from './modules/routes/index.js';

export interface BuildAppOptions {
  appEnv?: AppEnv;
}

export const buildApp = ({ appEnv = APP_ENV }: BuildAppOptions = {}) => {
  const app = Fastify({
    logger: true,
    trustProxy: TRUSTED_PROXIES ?? false,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(corsPlugin);

  app.register(databasePlugin);
  app.register(redisPlugin);
  app.register(authPlugin);
  app.register(oauthPlugin);
  app.register(mailerPlugin);
  app.register(storagePlugin);
  app.register(multipartPlugin);

  app.register(globalErrorHandler);

  // public routes
  app.register(authModule, { prefix: '/auth', appEnv });
  app.register(healthModule, { prefix: '/health' });
  app.register(contactModule, { prefix: '/contact' });

  // protected routes
  app.register(async (protectedApp) => {
    protectedApp.addHook('onRequest', protectedApp.authenticate);

    protectedApp.register(usersModule, { prefix: '/users' });
    protectedApp.register(ridesModule, { prefix: '/rides' });
    protectedApp.register(routesModule, { prefix: '/routes' });
  });

  return app;
};
