import { describe, it, expect, beforeEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { useApp } from '../../helpers/app.js';
import { selected_locations, users } from '../../../src/db/schema.js';

describe('POST /auth/register', () => {
  const appRef = useApp();

  it('creates a user and sets auth cookies', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/register',
      body: { email: 'test@example.com', password: 'Password123!', username: 'test' },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.user.email).toBe('test@example.com');
    expect(body.user.username).toBe('test');
    expect(body.user.password_hash).toBeUndefined();

    const cookies = response.cookies;
    const accessToken = cookies.find((c) => c.name === 'accessToken');
    const refreshToken = cookies.find((c) => c.name === 'refreshToken');

    expect(accessToken).toBeDefined();
    expect(accessToken?.httpOnly).toBe(true);
    expect(accessToken?.path).toBe('/');

    expect(refreshToken).toBeDefined();
    expect(refreshToken?.httpOnly).toBe(true);
    expect(refreshToken?.path).toBe('/');
    expect(refreshToken?.value).toMatch(/^[0-9a-f-]{36}\.[0-9a-f]{64}$/); // {familyUuid}.{rawToken}
  });

  it('leaves the new rider without a Selected Location', async () => {
    await appRef.app.inject({
      method: 'POST',
      url: '/auth/register',
      body: { email: 'test@example.com', password: 'Password123!', username: 'test' },
    });

    const [user] = await appRef.app.db
      .select()
      .from(users)
      .where(eq(users.email, 'test@example.com'))
      .limit(1);
    const selectedLocations = await appRef.app.db
      .select()
      .from(selected_locations)
      .where(eq(selected_locations.user_id, user.id));

    expect(selectedLocations).toEqual([]);
  });

  it('returns 409 when email already exists', async () => {
    const body = { email: 'test@example.com', password: 'Password123!', username: 'test' };

    await appRef.app.inject({ method: 'POST', url: '/auth/register', body });
    const response = await appRef.app.inject({ method: 'POST', url: '/auth/register', body });

    expect(response.statusCode).toBe(409);
  });

  it('returns 400 for missing email', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/register',
      body: { password: 'Password123!' },
    });

    expect(response.statusCode).toBe(400);
  });

  it.each([
    ['is shorter than 8 characters', 'Ab-1'],
    ['has no uppercase letter', 'password123!'],
    ['has no special character', 'Password123'],
  ])('returns 400 for a password that %s', async (_rule, password) => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/register',
      body: { email: 'test@example.com', password, username: 'test' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ type: 'INVALID_INPUT', field: 'password' });
  });

  it.each([
    ['empty', ''],
    ['only spaces', '     '],
    ['2 characters', 'ab'],
    ['2 characters after trimming', '  ab  '],
    ['31 characters', 'a'.repeat(31)],
  ])('returns 400 for a username that is %s', async (_case, username) => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/register',
      body: { email: 'test@example.com', password: 'Password123!', username },
    });

    expect(response.statusCode).toBe(400);
  });

  it('accepts a 3-character username', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/register',
      body: { email: 'test@example.com', password: 'Password123!', username: 'abc' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user.username).toBe('abc');
  });

  it('accepts a 30-character username', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/register',
      body: { email: 'test@example.com', password: 'Password123!', username: 'a'.repeat(30) },
    });

    expect(response.statusCode).toBe(200);
  });

  it('stores the username without surrounding spaces', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/register',
      body: { email: 'test@example.com', password: 'Password123!', username: '  abc  ' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user.username).toBe('abc');

    const me = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
      cookies: { accessToken: response.cookies.find((c) => c.name === 'accessToken')!.value },
    });

    expect(me.json().user.username).toBe('abc');
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
          body: { email: `test${i}@example.com`, password: 'Password123!', username: 'test' },
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
