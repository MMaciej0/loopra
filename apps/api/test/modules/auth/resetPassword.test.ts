import { beforeEach, describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { createPasswordResetToken } from '../../../src/modules/auth/services/passwordResetToken.js';
import { oauth_accounts, users } from '../../../src/db/schema.js';
import { eq } from 'drizzle-orm';

describe('POST /auth/reset-password', () => {
  const appRef = useApp();

  const USER_EMAIL = 'reset@example.com';
  const USER_PASSWORD = 'original-Password123!';

  beforeEach(async () => {
    await appRef.app.inject({
      method: 'POST',
      url: '/auth/register',
      body: { email: USER_EMAIL, password: USER_PASSWORD, username: 'test' },
    });
  });

  it('returns 400 for missing token', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/reset-password',
      body: { password: 'new-Password123!' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 for missing password', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/reset-password',
      body: { token: 'some-token' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 401 for invalid token', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/reset-password',
      body: { token: 'invalid-token', password: 'new-Password123!' },
    });

    expect(response.statusCode).toBe(401);
  });

  describe('with valid token', () => {
    let rawToken: string;

    beforeEach(async () => {
      const [user] = await appRef.app.db
        .select()
        .from(users)
        .where(eq(users.email, USER_EMAIL))
        .limit(1);

      const result = await createPasswordResetToken(appRef.app.redis, user.id);
      rawToken = result.rawToken;
    });

    it('returns 200 and password is updated', async () => {
      const newPassword = 'new-Password123!';

      const response = await appRef.app.inject({
        method: 'POST',
        url: '/auth/reset-password',
        body: { token: rawToken, password: newPassword },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ message: 'Password reset successful' });

      const loginResponse = await appRef.app.inject({
        method: 'POST',
        url: '/auth/login',
        body: { email: USER_EMAIL, password: newPassword },
      });

      expect(loginResponse.statusCode).toBe(200);
    });

    it('returns 200 and password is updated when a Google account is also linked', async () => {
      const newPassword = 'new-Password123!';
      const [user] = await appRef.app.db
        .select()
        .from(users)
        .where(eq(users.email, USER_EMAIL))
        .limit(1);
      await appRef.app.db.insert(oauth_accounts).values({
        provider: 'google',
        provider_user_id: 'google-sub-123',
        user_id: user.id,
      });

      const response = await appRef.app.inject({
        method: 'POST',
        url: '/auth/reset-password',
        body: { token: rawToken, password: newPassword },
      });

      expect(response.statusCode).toBe(200);

      const loginResponse = await appRef.app.inject({
        method: 'POST',
        url: '/auth/login',
        body: { email: USER_EMAIL, password: newPassword },
      });

      expect(loginResponse.statusCode).toBe(200);
    });

    it.each([
      ['is shorter than 8 characters', 'Ab-1'],
      ['has no uppercase letter', 'new-password123!'],
      ['has no special character', 'NewPassword123'],
    ])('returns 400 for a password that %s', async (_rule, password) => {
      const response = await appRef.app.inject({
        method: 'POST',
        url: '/auth/reset-password',
        body: { token: rawToken, password },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({ type: 'INVALID_INPUT', field: 'password' });
    });

    it('rejects token reuse', async () => {
      const newPassword = 'new-Password123!';

      const first = await appRef.app.inject({
        method: 'POST',
        url: '/auth/reset-password',
        body: { token: rawToken, password: newPassword },
      });
      expect(first.statusCode).toBe(200);

      const second = await appRef.app.inject({
        method: 'POST',
        url: '/auth/reset-password',
        body: { token: rawToken, password: 'another-Password123!' },
      });
      expect(second.statusCode).toBe(401);
    });
  });
});
