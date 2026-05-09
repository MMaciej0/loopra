import { FastifyInstance } from 'fastify';
import { beforeEach } from 'vitest';

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

export const useAuthenticatedUser = (appRef: { app: FastifyInstance }, customEmail?: string) => {
  const auth = { accessToken: '', userId: '', email: '' };

  beforeEach(async () => {
    const { accessToken, userId, email } = await registerUser(appRef.app, customEmail);
    auth.accessToken = accessToken;
    auth.userId = userId;
    auth.email = email;
  });

  return auth;
};
