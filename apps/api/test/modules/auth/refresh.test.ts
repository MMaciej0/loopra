import { beforeEach, describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';

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
      await appRef.app.inject({
        method: 'POST',
        url: '/auth/refresh',
        cookies: { refreshToken },
      });

      // Replay the old token — theft detection should trigger
      const response = await appRef.app.inject({
        method: 'POST',
        url: '/auth/refresh',
        cookies: { refreshToken },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({ type: 'INVALID_TOKEN' });

      const clearedRefreshToken = response.cookies.find((c) => c.name === 'refreshToken');
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
  });
});
