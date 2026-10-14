import { beforeEach, describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { replacedTokenKey } from '../../../src/modules/auth/services/tokenFamily.js';

describe('POST /auth/refresh', () => {
  const appRef = useApp();

  it('returns 401 when refreshToken cookie is not present', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/refresh',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ type: 'UNAUTHORIZED' });
  });

  describe('when refresh token is present', () => {
    const TEST_EMAIL = 'refresh-test@example.com';
    const TEST_PASSWORD = 'Password123!';
    let refreshToken: string;

    const refresh = (token: string) =>
      appRef.app.inject({
        method: 'POST',
        url: '/auth/refresh',
        cookies: { refreshToken: token },
      });

    const endReuseWindow = async (token: string) => {
      const [familyUuid] = token.split('.');
      await appRef.app.redis.del(replacedTokenKey(familyUuid));
    };

    beforeEach(async () => {
      const registerResponse = await appRef.app.inject({
        method: 'POST',
        url: '/auth/register',
        body: { email: TEST_EMAIL, password: TEST_PASSWORD, username: 'test' },
      });

      refreshToken = registerResponse.cookies.find((c) => c.name === 'refreshToken')?.value || '';
    });

    it('returns 401 and invalid token error when refresh token is invalid', async () => {
      const response = await appRef.app.inject({
        method: 'POST',
        url: '/auth/refresh',
        cookies: { refreshToken: 'invalid-refresh-token' },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({ type: 'INVALID_TOKEN' });
    });

    it('returns 200 and sets new auth cookies when refresh token is valid', async () => {
      const response = await appRef.app.inject({
        method: 'POST',
        url: '/auth/refresh',
        cookies: { refreshToken },
      });

      expect(response.statusCode).toBe(200);
      expect(Object.keys(response.json())).toEqual(['user']);
      expect(Object.keys(response.json().user)).toEqual(['id']);

      const cookies = response.cookies;
      const newAccessToken = cookies.find((c) => c.name === 'accessToken');
      const newRefreshToken = cookies.find((c) => c.name === 'refreshToken');

      expect(newAccessToken).toBeDefined();
      expect(newAccessToken?.httpOnly).toBe(true);

      expect(newRefreshToken).toBeDefined();
      expect(newRefreshToken?.httpOnly).toBe(true);
      expect(newRefreshToken?.value).toMatch(/^[0-9a-f-]{36}\.[0-9a-f]{64}$/);
      expect(newRefreshToken?.value).not.toBe(refreshToken);
    });

    it('returns 401 and clears cookies when a previously used (old) refresh token is replayed', async () => {
      // Consume the token once — rotation issues a new token
      const response = await appRef.app.inject({
        method: 'POST',
        url: '/auth/refresh',
        cookies: { refreshToken },
      });

      const responseToken = response.cookies.find((c) => c.name === 'refreshToken')?.value || '';
      const [familyUuid, _] = responseToken.split('.');
      const replacedFamilyKey = replacedTokenKey(familyUuid);
      await appRef.app.redis.del(replacedFamilyKey);

      // Replay the old token — theft detection should trigger
      const secondResponse = await appRef.app.inject({
        method: 'POST',
        url: '/auth/refresh',
        cookies: { refreshToken },
      });

      expect(secondResponse.statusCode).toBe(401);
      expect(secondResponse.json()).toMatchObject({ type: 'INVALID_TOKEN' });

      const clearedRefreshToken = secondResponse.cookies.find((c) => c.name === 'refreshToken');
      expect(clearedRefreshToken?.value).toBe('');
    });

    it('invalidates all sessions when token reuse is detected (stolen token scenario)', async () => {
      // Simulate a second device by logging in — gets its own family
      const loginResponse = await appRef.app.inject({
        method: 'POST',
        url: '/auth/login',
        body: { email: TEST_EMAIL, password: TEST_PASSWORD },
      });
      const secondDeviceToken =
        loginResponse.cookies.find((c) => c.name === 'refreshToken')?.value || '';

      // Attacker rotates the stolen token first — device A's token advances
      await appRef.app.inject({
        method: 'POST',
        url: '/auth/refresh',
        cookies: { refreshToken },
      });

      const [familyUuid] = refreshToken.split('.');
      await appRef.app.redis.del(replacedTokenKey(familyUuid));

      // Legitimate user replays the original (now stale) token — theft detected
      await appRef.app.inject({
        method: 'POST',
        url: '/auth/refresh',
        cookies: { refreshToken },
      });

      // Second device's token must also be invalidated
      const secondDeviceResponse = await appRef.app.inject({
        method: 'POST',
        url: '/auth/refresh',
        cookies: { refreshToken: secondDeviceToken },
      });

      expect(secondDeviceResponse.statusCode).toBe(401);
      expect(secondDeviceResponse.json()).toMatchObject({ type: 'INVALID_TOKEN' });
    });

    it('rotates the token once when 10 refreshes with the same token arrive in parallel', async () => {
      const responses = await Promise.all(
        Array.from({ length: 10 }, () =>
          appRef.app.inject({
            method: 'POST',
            url: '/auth/refresh',
            cookies: { refreshToken },
          }),
        ),
      );

      const tokens = responses.map(
        (response) => response.cookies.find((c) => c.name === 'refreshToken')?.value || null,
      );
      const responseStatuses = responses.map((response) => response.statusCode);

      expect(responseStatuses.filter((statusCode) => statusCode === 200)).toHaveLength(10);
      expect(tokens.filter((token) => Boolean(token))).toHaveLength(1);

      const correctToken = tokens.find((token) => Boolean(token))!;

      const secondTokenRefreshResponse = await appRef.app.inject({
        method: 'POST',
        url: '/auth/refresh',
        cookies: { refreshToken: correctToken },
      });

      expect(secondTokenRefreshResponse.statusCode).toBe(200);
    });

    it('keeps other devices logged in after parallel refreshes on one device', async () => {
      const loginResponse = await appRef.app.inject({
        method: 'POST',
        url: '/auth/login',
        body: { email: TEST_EMAIL, password: TEST_PASSWORD },
      });
      const secondDeviceToken =
        loginResponse.cookies.find((c) => c.name === 'refreshToken')?.value || '';

      const responses = await Promise.all(Array.from({ length: 10 }, () => refresh(refreshToken)));
      const receivedTokens = responses
        .map((response) => response.cookies.find((c) => c.name === 'refreshToken')?.value)
        .filter((token) => Boolean(token));

      await endReuseWindow(refreshToken);

      for (const token of receivedTokens) {
        await refresh(token!);
      }

      const secondDeviceResponse = await refresh(secondDeviceToken);

      expect(secondDeviceResponse.statusCode).toBe(200);
    });

    it('answers a replaced token inside the reuse window with an access token only', async () => {
      await refresh(refreshToken);

      const response = await refresh(refreshToken);

      expect(response.statusCode).toBe(200);
      expect(response.cookies.find((c) => c.name === 'accessToken')?.value).toBeTruthy();
      expect(response.cookies.find((c) => c.name === 'refreshToken')).toBeUndefined();
    });

    it('never gives a refresh token for a replaced token used twice inside the reuse window', async () => {
      await refresh(refreshToken);

      const firstReuse = await refresh(refreshToken);
      const secondReuse = await refresh(refreshToken);

      expect(firstReuse.statusCode).toBe(200);
      expect(secondReuse.statusCode).toBe(200);
      expect(firstReuse.cookies.find((c) => c.name === 'refreshToken')).toBeUndefined();
      expect(secondReuse.cookies.find((c) => c.name === 'refreshToken')).toBeUndefined();
    });

    it('treats a token that matches nothing as theft inside the reuse window', async () => {
      await refresh(refreshToken);

      const [familyUuid] = refreshToken.split('.');
      const response = await refresh(`${familyUuid}.${'0'.repeat(64)}`);

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({ type: 'INVALID_TOKEN' });
      expect(await appRef.app.redis.exists(`family:${familyUuid}`)).toBe(0);
    });

    it('refuses a replaced token after logout', async () => {
      const rotateResponse = await refresh(refreshToken);
      const newRefreshToken =
        rotateResponse.cookies.find((c) => c.name === 'refreshToken')?.value || '';

      await appRef.app.inject({
        method: 'DELETE',
        url: '/auth/logout',
        cookies: { refreshToken: newRefreshToken },
      });

      const response = await refresh(refreshToken);

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({ type: 'INVALID_TOKEN' });
    });
  });
});
