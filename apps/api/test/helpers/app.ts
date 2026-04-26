import { beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../src/app.js';
import type { FastifyInstance } from 'fastify';

export const createTestApp = async () => {
  const app = buildApp();
  await app.ready();
  return app;
};

export const useApp = () => {
  const ref = { app: null as unknown as FastifyInstance };

  beforeAll(async () => {
    ref.app = await createTestApp();
  });

  afterAll(async () => {
    await ref.app.close();
  });

  return ref;
};
