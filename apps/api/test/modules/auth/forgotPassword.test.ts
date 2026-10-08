import { beforeEach, describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';

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
