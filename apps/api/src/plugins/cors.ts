import fastifyPlugin from 'fastify-plugin';
import cors from '@fastify/cors';
import { APP_URL, NODE_ENV } from '../config/env.js';

const DEV_ORIGINS = new Set(['localhost', '127.0.0.1']);

export default fastifyPlugin(async (fastify) => {
  await fastify.register(cors, {
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      let hostname: string;
      try {
        hostname = new URL(origin).hostname;
      } catch {
        callback(new Error('Not allowed'), false);
        return;
      }

      if (DEV_ORIGINS.has(hostname)) {
        callback(null, true);
        return;
      }

      if (NODE_ENV === 'production' && origin === APP_URL) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed'), false);
    },
  });
});
