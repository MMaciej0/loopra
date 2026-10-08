import { beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { useApp } from '../../helpers/app.js';
import { oauth_accounts, users } from '../../../src/db/schema.js';

describe('POST /auth/forgot-password', () => {
  const appRef = useApp();

  it('returns 400 for missing email', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/forgot-password',
    });

    expect(response.statusCode).toBe(400);
  });

  describe('when email is sent', () => {
    it('returns 200 if user does not exist', async () => {
      const response = await appRef.app.inject({
        method: 'POST',
        url: '/auth/forgot-password',
        body: { email: 'test@example.com' },
      });

      expect(response.statusCode).toBe(200);
    });

    describe('when user exists', () => {
      const EXISTING_EMAIL = 'existing@example.com';
      const TEST_PASSWORD = 'correct-Password123!';

      beforeEach(async () => {
        await appRef.app.inject({
          method: 'POST',
          url: '/auth/register',
          body: { email: EXISTING_EMAIL, password: TEST_PASSWORD, username: 'test' },
        });
      });

      it('returns 200', async () => {
        const response = await appRef.app.inject({
          method: 'POST',
          url: '/auth/forgot-password',
          body: { email: EXISTING_EMAIL },
        });

        expect(response.statusCode).toBe(200);
      });

      it('creates new password reset token', async () => {
        await appRef.app.inject({
          method: 'POST',
          url: '/auth/forgot-password',
          body: { email: EXISTING_EMAIL },
        });

        const keys = await appRef.app.redis.keys('password-reset:*');
        expect(keys.length).toBe(1);
      });

      it('creates new password reset token when a Google account is also linked', async () => {
        const [user] = await appRef.app.db
          .select()
          .from(users)
          .where(eq(users.email, EXISTING_EMAIL))
          .limit(1);
        await appRef.app.db.insert(oauth_accounts).values({
          provider: 'google',
          provider_user_id: 'google-sub-123',
          user_id: user.id,
        });

        await appRef.app.inject({
          method: 'POST',
          url: '/auth/forgot-password',
          body: { email: EXISTING_EMAIL },
        });

        const keys = await appRef.app.redis.keys('password-reset:*');
        expect(keys.length).toBe(1);
      });
    });

    describe('when the account has no password', () => {
      const GOOGLE_EMAIL = 'google@example.com';

      beforeEach(async () => {
        await appRef.app.db.insert(users).values({ email: GOOGLE_EMAIL });
      });

      it('creates no password reset token', async () => {
        await appRef.app.inject({
          method: 'POST',
          url: '/auth/forgot-password',
          body: { email: GOOGLE_EMAIL },
        });

        const keys = await appRef.app.redis.keys('password-reset:*');
        expect(keys.length).toBe(0);
      });

      it('answers the same as for a password account and for an unknown email', async () => {
        const PASSWORD_EMAIL = 'password@example.com';
        await appRef.app.inject({
          method: 'POST',
          url: '/auth/register',
          body: { email: PASSWORD_EMAIL, password: 'correct-Password123!', username: 'test' },
        });

        const forgotPassword = (email: string) =>
          appRef.app.inject({ method: 'POST', url: '/auth/forgot-password', body: { email } });

        const googleResponse = await forgotPassword(GOOGLE_EMAIL);
        const passwordResponse = await forgotPassword(PASSWORD_EMAIL);
        const unknownResponse = await forgotPassword('unknown@example.com');

        expect(googleResponse.statusCode).toBe(200);
        expect(googleResponse.json()).toEqual({
          message: 'If that email exists, a reset link has been sent.',
        });
        expect(passwordResponse.statusCode).toBe(googleResponse.statusCode);
        expect(passwordResponse.body).toBe(googleResponse.body);
        expect(unknownResponse.statusCode).toBe(googleResponse.statusCode);
        expect(unknownResponse.body).toBe(googleResponse.body);
      });
    });
  });

  describe('when email send rate limit is exceeded', () => {
    beforeEach(async () => {
      const ipKeys = await appRef.app.redis.keys('rate-limit:email-send:ip:*');
      const addressKeys = await appRef.app.redis.keys('rate-limit:email-send:address:*');
      if (ipKeys.length > 0) await appRef.app.redis.del(...ipKeys);
      if (addressKeys.length > 0) await appRef.app.redis.del(...addressKeys);
    });

    const RATE_LIMIT = 3;

    it('returns 429 when address rate limit is exceeded', async () => {
      for (let i = 1; i <= RATE_LIMIT + 1; i++) {
        const response = await appRef.app.inject({
          method: 'POST',
          url: '/auth/forgot-password',
          body: { email: 'target@example.com' },
        });

        if (i <= RATE_LIMIT) {
          expect(response.statusCode).toBe(200);
        } else {
          expect(response.statusCode).toBe(429);
        }
      }
    });

    it('returns 429 when address rate limit is exceeded for an account with no password', async () => {
      const GOOGLE_EMAIL = 'google@example.com';
      await appRef.app.db.insert(users).values({ email: GOOGLE_EMAIL });

      for (let i = 1; i <= RATE_LIMIT + 1; i++) {
        const response = await appRef.app.inject({
          method: 'POST',
          url: '/auth/forgot-password',
          body: { email: GOOGLE_EMAIL },
        });

        if (i <= RATE_LIMIT) {
          expect(response.statusCode).toBe(200);
        } else {
          expect(response.statusCode).toBe(429);
        }
      }
    });

    it('returns 429 when ip rate limit is exceeded', async () => {
      for (let i = 1; i <= RATE_LIMIT + 1; i++) {
        const response = await appRef.app.inject({
          method: 'POST',
          url: '/auth/forgot-password',
          body: { email: `unique${i}@example.com` },
        });

        if (i <= RATE_LIMIT) {
          expect(response.statusCode).toBe(200);
        } else {
          expect(response.statusCode).toBe(429);
        }
      }
    });
  });
});
