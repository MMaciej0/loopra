import { beforeEach, describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';

describe('DELETE /auth/logout', () => {
  const appRef = useApp();

  describe('when refreshTokenCookie is not present', () => {
    it('returns 401 status with unauthorize error', async () => {
      const response = await appRef.app.inject({
        method: 'DELETE',
        url: '/auth/logout',
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({ type: 'UNAUTHORIZED' });
    });
  });

  describe('when refresh token is present', () => {
    const TEST_EMAIL = 'logout-test@example.com';
    const TEST_PASSWORD = 'password123';
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
        method: 'DELETE',
        url: '/auth/logout',
        cookies: { refreshToken: 'invalid-refresh-token' },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({ type: 'INVALID_TOKEN' });
    });

    it('returns 200 and success message when refresh token is valid', async () => {
      const response = await appRef.app.inject({
        method: 'DELETE',
        url: '/auth/logout',
        cookies: { refreshToken },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ message: 'Logout successful' });
    });
  });
});
