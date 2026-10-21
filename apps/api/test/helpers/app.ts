import { beforeAll, afterAll } from 'vitest';
import { buildApp, type BuildAppOptions } from '../../src/app.js';
import type { FastifyInstance } from 'fastify';

export const createTestApp = async (options?: BuildAppOptions) => {
  const app = buildApp(options);
  await app.ready();
  return app;
};

export const useApp = (options?: BuildAppOptions) => {
  const ref = { app: null as unknown as FastifyInstance };

  beforeAll(async () => {
    ref.app = await createTestApp(options);
  });

  afterAll(async () => {
    await ref.app.close();
  });

  return ref;
};
