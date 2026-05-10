import { beforeEach, describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { createEmailVerificationToken } from '../../../src/modules/auth/services/emailVerificationToken.js';
import { users } from '../../../src/db/schema.js';
import { eq } from 'drizzle-orm';

describe('POST /auth/verify-email', () => {
  const appRef = useApp();

  const USER_EMAIL = 'verify@example.com';

  beforeEach(async () => {
    await appRef.app.db.insert(users).values({ email: USER_EMAIL });
  });

  it('returns 400 for missing token', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/verify-email',
      body: {},
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 for invalid token', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/auth/verify-email',
      body: { token: 'invalid-token' },
    });

    expect(response.statusCode).toBe(400);
  });

  describe('with valid token', () => {
    let rawToken: string;

    beforeEach(async () => {
      const result = await createEmailVerificationToken(appRef.app.redis, USER_EMAIL);
      rawToken = result.rawToken;
    });

    it('returns 200', async () => {
      const response = await appRef.app.inject({
        method: 'POST',
        url: '/auth/verify-email',
        body: { token: rawToken },
      });

      expect(response.statusCode).toBe(200);
    });

    it('sets email_verified and email_verified_at on user', async () => {
      await appRef.app.inject({
        method: 'POST',
        url: '/auth/verify-email',
        body: { token: rawToken },
      });

      const [user] = await appRef.app.db
        .select()
        .from(users)
        .where(eq(users.email, USER_EMAIL))
        .limit(1);

      expect(user.email_verified).toBe(true);
      expect(user.email_verified_at).not.toBeNull();
    });

    it('rejects token reuse', async () => {
      await appRef.app.inject({
        method: 'POST',
        url: '/auth/verify-email',
        body: { token: rawToken },
      });

      const second = await appRef.app.inject({
        method: 'POST',
        url: '/auth/verify-email',
        body: { token: rawToken },
      });

      expect(second.statusCode).toBe(400);
    });
  });
});
