import { beforeEach, describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { users } from '../../../src/db/schema.js';
import { eq } from 'drizzle-orm';

describe('POST /auth/resend-verification-email', () => {
  const appRef = useApp();

  beforeEach(async () => {
    const keys = await appRef.app.redis.keys('email-verification:*');
    if (keys.length > 0) await appRef.app.redis.del(...keys);
  });

  it('returns 200 when user does not exist', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/resend-verification-email',
      body: { email: 'nonexistent@example.com' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      message: 'If that email exists and is unverified, a new link has been sent.',
    });
  });

  it('returns 400 for missing email', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/resend-verification-email',
      body: {},
    });

    expect(response.statusCode).toBe(400);
  });

  describe('when user exists and is unverified', () => {
    const USER_EMAIL = 'resend@example.com';

    beforeEach(async () => {
      await appRef.app.db.insert(users).values({ email: USER_EMAIL });
    });

    it('returns 200', async () => {
      const response = await appRef.app.inject({
        method: 'POST',
        url: '/auth/resend-verification-email',
        body: { email: USER_EMAIL },
      });

      expect(response.statusCode).toBe(200);
    });

    it('invalidates previous token when resending', async () => {
      await appRef.app.inject({
        method: 'POST',
        url: '/auth/resend-verification-email',
        body: { email: USER_EMAIL },
      });

      const firstHash = await appRef.app.redis.get(`email-verification:email:${USER_EMAIL}`);
      expect(firstHash).not.toBeNull();

      await appRef.app.inject({
        method: 'POST',
        url: '/auth/resend-verification-email',
        body: { email: USER_EMAIL },
      });

      const oldTokenGone = await appRef.app.redis.get(`email-verification:${firstHash}`);
      expect(oldTokenGone).toBeNull();

      const newHash = await appRef.app.redis.get(`email-verification:email:${USER_EMAIL}`);
      expect(newHash).not.toBeNull();
      expect(newHash).not.toBe(firstHash);
    });
  });

  describe('when user is already verified', () => {
    const USER_EMAIL = 'already-verified@example.com';

    beforeEach(async () => {
      await appRef.app.db.insert(users).values({
        email: USER_EMAIL,
        email_verified: true,
        email_verified_at: new Date(),
      });
    });

    it('returns 200 without creating a token', async () => {
      const response = await appRef.app.inject({
        method: 'POST',
        url: '/auth/resend-verification-email',
        body: { email: USER_EMAIL },
      });

      expect(response.statusCode).toBe(200);

      const keys = await appRef.app.redis.keys('email-verification:*');
      expect(keys.length).toBe(0);
    });
  });

  describe('when email send rate limit is exceeded', () => {
    const RATE_LIMIT = 3;

    it('returns 429 when address rate limit is exceeded', async () => {
      for (let i = 1; i <= RATE_LIMIT + 1; i++) {
        const response = await appRef.app.inject({
          method: 'POST',
          url: '/auth/resend-verification-email',
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
          url: '/auth/resend-verification-email',
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

  it('creates a verification token when the email is in a different letter case', async () => {
    await appRef.app.db.insert(users).values({ email: 'user@example.com' });

    await appRef.app.inject({
      method: 'POST',
      url: '/auth/resend-verification-email',
      body: { email: 'User@Example.com' },
    });

    const hash = await appRef.app.redis.get('email-verification:email:user@example.com');
    expect(hash).not.toBeNull();
  });
});
