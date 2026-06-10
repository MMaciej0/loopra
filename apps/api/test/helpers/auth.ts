import { FastifyInstance } from 'fastify';
import { beforeEach } from 'vitest';
import { users } from '../../src/db/schema.js';
import { eq } from 'drizzle-orm';

export const registerUser = async (
  app: FastifyInstance,
  email = 'test@example.com',
  password = 'password123',
  username = 'testuser',
) => {
  const response = await app.inject({
    method: 'POST',
    url: '/auth/register',
    body: { email, password, username },
  });

  const userId = response.json().user.id as string;

  await app.db
    .update(users)
    .set({ email_verified: true, email_verified_at: new Date() })
    .where(eq(users.id, userId));

  const accessToken = app.jwt.sign({ sub: userId, email_verified: true });

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
