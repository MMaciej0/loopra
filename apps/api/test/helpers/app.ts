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

export const registerUser = async (
  app: FastifyInstance,
  email = 'test@example.com',
  password = 'password123',
) => {
  const response = await app.inject({
    method: 'POST',
    url: '/auth/register',
    body: { email, password },
  });

  const accessToken = response.cookies.find((c) => c.name === 'accessToken')?.value ?? '';
  const userId = response.json().user.id as string;

  return { accessToken, userId, email };
};
