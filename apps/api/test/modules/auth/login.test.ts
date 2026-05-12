import { beforeEach, describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';

describe('POST /auth/login', () => {
  const appRef = useApp();

  it('returns status 400 and bad request body error for missing email', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/login',
      body: { password: 'password123' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ type: 'INVALID_INPUT', field: 'email' });
  });

  it('returns status 400 and bad request body error for missing password', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/login',
      body: { email: 'test@example.com' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ type: 'INVALID_INPUT', field: 'password' });
  });

  it('return status 401 when user is not found', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/login',
      body: { email: 'test@example.com', password: 'password-password' },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ type: 'USER_NOT_FOUND' });
  });

  describe('when user exists', () => {
    const TEST_EMAIL = 'wrongpassword@example.com';
    const TEST_PASSWORD = 'correct-password123';

    beforeEach(async () => {
      await appRef.app.inject({
        method: 'POST',
        url: '/auth/register',
        body: { email: TEST_EMAIL, password: TEST_PASSWORD },
      });
    });

    it('returns status 401 when password is incorrect', async () => {
      const response = await appRef.app.inject({
        method: 'POST',
        url: '/auth/login',
        body: { email: TEST_EMAIL, password: 'wrong-password' },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({ type: 'INVALID_PASSWORD' });
    });

    it('returns status 200 with user data and sets auth cookies when password is correct', async () => {
      const response = await appRef.app.inject({
        method: 'POST',
        url: '/auth/login',
        body: { email: TEST_EMAIL, password: TEST_PASSWORD },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ user: { email: TEST_EMAIL } });

      const cookies = response.cookies;
      expect(cookies.find((c) => c.name === 'accessToken')).toBeDefined();
      expect(cookies.find((c) => c.name === 'refreshToken')).toBeDefined();
    });

    describe('when rate limit is exceeded', () => {
      beforeEach(async () => {
        const ipKeys = await appRef.app.redis.keys('rate-limit:ip:*');
        const emailKeys = await appRef.app.redis.keys('rate-limit:email:*');
        if (emailKeys.length > 0) await appRef.app.redis.del(...emailKeys);
        if (ipKeys.length > 0) await appRef.app.redis.del(...ipKeys);
      });

      const RATE_LIMIT = 5;

      it('returns 429 because of ip rate limit', async () => {
        for (let i = 1; i <= RATE_LIMIT + 1; i++) {
          const response = await appRef.app.inject({
            method: 'POST',
            url: '/auth/login',
            body: { email: `test@example.com`, password: 'password123' },
          });

          if (i <= RATE_LIMIT) {
            expect(response.statusCode).toBe(401);
          } else {
            const ipValue = await appRef.app.redis.get('rate-limit:ip:127.0.0.1');
            const emailValue = await appRef.app.redis.get('rate-limit:email:test@example.com');
            expect(emailValue).toBe('5');
            expect(ipValue).toBe('5');
            expect(response.statusCode).toBe(429);
          }
        }
      });

      it('after 5 attempts fails and successful login returns 200 and clears rate limits', async () => {
        for (let i = 1; i <= RATE_LIMIT - 1; i++) {
          const response = await appRef.app.inject({
            method: 'POST',
            url: '/auth/login',
            body: { email: TEST_EMAIL, password: 'wrong-password' },
          });

          expect(response.statusCode).toBe(401);
        }

        const successfulResponse = await appRef.app.inject({
          method: 'POST',
          url: '/auth/login',
          body: { email: TEST_EMAIL, password: TEST_PASSWORD },
        });

        expect(successfulResponse.statusCode).toBe(200);

        const ipKeys = await appRef.app.redis.keys('rate-limit:ip:*');
        const emailKeys = await appRef.app.redis.keys('rate-limit:email:*');
        expect(ipKeys.length).toBe(0);
        expect(emailKeys.length).toBe(0);
      });
    });
  });
});
