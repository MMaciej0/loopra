import { describe, it, expect, beforeEach } from 'vitest';
import { useApp } from '../../helpers/app.js';

describe('POST /auth/register', () => {
  const appRef = useApp();

  it('creates a user and sets auth cookies', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/register',
      body: { email: 'test@example.com', password: 'password123' },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.user.email).toBe('test@example.com');
    expect(body.user.password_hash).toBeUndefined();

    const cookies = response.cookies;
    const accessToken = cookies.find((c) => c.name === 'accessToken');
    const refreshToken = cookies.find((c) => c.name === 'refreshToken');

    expect(accessToken).toBeDefined();
    expect(accessToken?.httpOnly).toBe(true);
    expect(accessToken?.path).toBe('/');

    expect(refreshToken).toBeDefined();
    expect(refreshToken?.httpOnly).toBe(true);
    expect(refreshToken?.path).toBe('/auth');
    expect(refreshToken?.value).toMatch(/^[0-9a-f-]{36}\.[0-9a-f]{64}$/); // {familyUuid}.{rawToken}
  });

  it('returns 409 when email already exists', async () => {
    const body = { email: 'test@example.com', password: 'password123' };

    await appRef.app.inject({ method: 'POST', url: '/auth/register', body });
    const response = await appRef.app.inject({ method: 'POST', url: '/auth/register', body });

    expect(response.statusCode).toBe(409);
  });

  it('returns 400 for missing email', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/register',
      body: { password: 'password123' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 for password shorter than 8 chars', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/register',
      body: { email: 'test@example.com', password: 'short' },
    });

    expect(response.statusCode).toBe(400);
  });

  describe('when ip rate limit is reached', () => {
    beforeEach(async () => {
      const ipKeys = await appRef.app.redis.keys('rate-limit:ip:*');
      if (ipKeys.length > 0) await appRef.app.redis.del(...ipKeys);
    });

    const RATE_LIMIT = 5;

    it('returns 429', async () => {
      for (let i = 1; i <= RATE_LIMIT + 1; i++) {
        const response = await appRef.app.inject({
          method: 'POST',
          url: '/auth/register',
          body: { email: `test${i}@example.com`, password: 'password123' },
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
