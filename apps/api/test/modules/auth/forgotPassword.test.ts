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
      const TEST_PASSWORD = 'correct-password123';

      beforeEach(async () => {
        await appRef.app.inject({
          method: 'POST',
          url: '/auth/register',
          body: { email: EXISTING_EMAIL, password: TEST_PASSWORD },
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
});
