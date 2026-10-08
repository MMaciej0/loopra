import { beforeEach, describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { users } from '../../../src/db/schema.js';

describe('POST /auth/change-password', () => {
  const appRef = useApp();

  const EMAIL = 'change@example.com';
  const CURRENT_PASSWORD = 'Current-Password123!';
  const NEW_PASSWORD = 'New-password456';

  let accessToken: string;
  let userId: string;

  const changePassword = (body: Record<string, unknown>, token = accessToken) =>
    appRef.app.inject({
      method: 'POST',
      url: '/auth/change-password',
      cookies: { accessToken: token },
      body,
    });

  const login = (password: string) =>
    appRef.app.inject({
      method: 'POST',
      url: '/auth/login',
      body: { email: EMAIL, password },
    });

  const refresh = (refreshToken: string) =>
    appRef.app.inject({
      method: 'POST',
      url: '/auth/refresh',
      cookies: { refreshToken },
    });

  const cookieValue = (response: Awaited<ReturnType<typeof login>>, name: string) =>
    response.cookies.find((cookie) => cookie.name === name)?.value ?? '';

  beforeEach(async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/register',
      body: { email: EMAIL, password: CURRENT_PASSWORD, username: 'test' },
    });

    accessToken = cookieValue(response, 'accessToken');
    userId = response.json().user.id;
  });

  it('returns 401 STALE_TOKEN without an access token', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/change-password',
      body: { current_password: CURRENT_PASSWORD, new_password: NEW_PASSWORD },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ type: 'STALE_TOKEN' });
  });

  it('writes the new password, so only the new one logs in', async () => {
    const response = await changePassword({
      current_password: CURRENT_PASSWORD,
      new_password: NEW_PASSWORD,
    });

    expect(response.statusCode).toBe(200);
    expect(Object.keys(response.json())).toEqual(['message']);

    expect((await login(NEW_PASSWORD)).statusCode).toBe(200);
    expect((await login(CURRENT_PASSWORD)).statusCode).toBe(401);
  });

  it('logs out every other session and keeps the current one', async () => {
    const otherSession = await login(CURRENT_PASSWORD);
    const otherRefreshToken = cookieValue(otherSession, 'refreshToken');

    const response = await changePassword({
      current_password: CURRENT_PASSWORD,
      new_password: NEW_PASSWORD,
    });

    const otherRefresh = await refresh(otherRefreshToken);
    expect(otherRefresh.statusCode).toBe(401);
    expect(otherRefresh.json()).toMatchObject({ type: 'INVALID_TOKEN' });

    const meResponse = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
      cookies: { accessToken: cookieValue(response, 'accessToken') },
    });
    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.json().user.id).toBe(userId);

    expect((await refresh(cookieValue(response, 'refreshToken'))).statusCode).toBe(200);
  });

  it('answers 400 INVALID_PASSWORD for a wrong current password and changes nothing', async () => {
    const response = await changePassword({
      current_password: 'Wrong-Password123!',
      new_password: NEW_PASSWORD,
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ type: 'INVALID_PASSWORD' });
    expect(response.cookies).toEqual([]);

    expect((await login(CURRENT_PASSWORD)).statusCode).toBe(200);
    expect((await login(NEW_PASSWORD)).statusCode).toBe(401);
  });

  it('answers 409 OAUTH_ONLY_ACCOUNT for an account with no password', async () => {
    const [googleRider] = await appRef.app.db
      .insert(users)
      .values({ email: 'google@example.com' })
      .returning();
    const googleToken = appRef.app.jwt.sign({ sub: googleRider.id, email_verified: true });

    const response = await changePassword(
      { current_password: CURRENT_PASSWORD, new_password: NEW_PASSWORD },
      googleToken,
    );

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ type: 'OAUTH_ONLY_ACCOUNT' });
  });

  it.each([
    ['is shorter than 8 characters', 'Ab-1'],
    ['has no uppercase letter', 'new-password456'],
    ['has no special character', 'NewPassword456'],
  ])('rejects a new password that %s', async (_rule, newPassword) => {
    const response = await changePassword({
      current_password: CURRENT_PASSWORD,
      new_password: newPassword,
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ type: 'INVALID_INPUT', field: 'new_password' });
  });

  it('does not check the current password against the rules', async () => {
    const response = await changePassword({
      current_password: 'weak',
      new_password: NEW_PASSWORD,
    });

    expect(response.json()).toMatchObject({ type: 'INVALID_PASSWORD' });
  });

  it('allows a new password equal to the current one', async () => {
    const response = await changePassword({
      current_password: CURRENT_PASSWORD,
      new_password: CURRENT_PASSWORD,
    });

    expect(response.statusCode).toBe(200);
  });

  describe('rate limit', () => {
    const RATE_LIMIT = 5;

    const failOnce = () =>
      changePassword({ current_password: 'Wrong-Password123!', new_password: NEW_PASSWORD });

    it('answers 429 on the sixth try', async () => {
      for (let i = 1; i <= RATE_LIMIT; i++) {
        expect((await failOnce()).statusCode).toBe(400);
      }

      const response = await changePassword({
        current_password: CURRENT_PASSWORD,
        new_password: NEW_PASSWORD,
      });

      expect(response.statusCode).toBe(429);
      expect(response.json()).toMatchObject({ type: 'RATE_LIMIT_EXCEEDED' });
    });

    it('clears the counter after a success', async () => {
      for (let i = 1; i < RATE_LIMIT; i++) {
        await failOnce();
      }
      expect(await appRef.app.redis.get(`rate-limit:password-change:${userId}`)).toBe('4');

      const response = await changePassword({
        current_password: CURRENT_PASSWORD,
        new_password: NEW_PASSWORD,
      });

      expect(response.statusCode).toBe(200);
      expect(await appRef.app.redis.get(`rate-limit:password-change:${userId}`)).toBeNull();
    });

    it('does not touch the login rate limits', async () => {
      const loginKeys = async () => ({
        ip: await appRef.app.redis.get('rate-limit:ip:127.0.0.1'),
        email: await appRef.app.redis.get(`rate-limit:email:${EMAIL}`),
      });
      const before = await loginKeys();

      for (let i = 1; i <= RATE_LIMIT + 1; i++) {
        await failOnce();
      }

      expect(await loginKeys()).toEqual(before);
      expect((await login(CURRENT_PASSWORD)).statusCode).toBe(200);
    });
  });
});
