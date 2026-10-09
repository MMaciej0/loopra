import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { oauth_accounts, selected_locations, users } from '../../../src/db/schema.js';
import { eq } from 'drizzle-orm';

describe('GET /auth/google/callback', () => {
  const appRef = useApp();

  const GOOGLE_SUB = 'google_sub_123';
  const EMAIL = 'test@example.com';
  const FAKE_TOKEN = 'fake_token';

  beforeEach(() => {
    (appRef.app as any).oauth2Google = {
      getAccessTokenFromAuthorizationCodeFlow: vi.fn().mockResolvedValue({
        token: { access_token: FAKE_TOKEN },
      }),
      userinfo: vi.fn().mockResolvedValue({ sub: GOOGLE_SUB, email: EMAIL, email_verified: true }),
    };
  });

  describe('when oauth account already exists (returning user)', () => {
    beforeEach(async () => {
      const [user] = await appRef.app.db.insert(users).values({ email: EMAIL }).returning();
      await appRef.app.db.insert(oauth_accounts).values({
        provider: 'google',
        provider_user_id: GOOGLE_SUB,
        user_id: user.id,
      });
    });

    it('redirects to frontend', async () => {
      const response = await appRef.app.inject({
        method: 'GET',
        url: '/auth/google/callback',
      });

      expect(response.statusCode).toBe(302);
    });

    it('sets auth cookies', async () => {
      const response = await appRef.app.inject({
        method: 'GET',
        url: '/auth/google/callback',
      });

      const accessToken = response.cookies.find((c) => c.name === 'accessToken');
      const refreshToken = response.cookies.find((c) => c.name === 'refreshToken');

      expect(accessToken).toBeDefined();
      expect(accessToken?.sameSite).toBe('Lax');
      expect(refreshToken).toBeDefined();
      expect(refreshToken?.sameSite).toBe('Lax');
    });
  });

  describe('when user exists by email but has no oauth account (first google login)', () => {
    beforeEach(async () => {
      await appRef.app.db
        .insert(users)
        .values({ email: EMAIL, password_hash: 'hashed' })
        .returning();
    });

    it('links oauth account to existing user', async () => {
      await appRef.app.inject({
        method: 'GET',
        url: '/auth/google/callback',
      });

      const [oauthAccount] = await appRef.app.db
        .select()
        .from(oauth_accounts)
        .where(eq(oauth_accounts.provider_user_id, GOOGLE_SUB))
        .limit(1);

      expect(oauthAccount).toBeDefined();

      const [user] = await appRef.app.db
        .select()
        .from(users)
        .where(eq(users.email, EMAIL))
        .limit(1);

      expect(user).toBeDefined();
      expect(oauthAccount?.user_id).toBe(user?.id);
    });

    it('redirects and sets auth cookies', async () => {
      const response = await appRef.app.inject({
        method: 'GET',
        url: '/auth/google/callback',
      });

      expect(response.cookies.find((c) => c.name === 'accessToken')).toBeDefined();
      expect(response.cookies.find((c) => c.name === 'refreshToken')).toBeDefined();
      expect(response.statusCode).toBe(302);
    });
  });

  describe('when user does not exist at all (brand new user)', () => {
    it('creates user with null password_hash', async () => {
      await appRef.app.inject({
        method: 'GET',
        url: '/auth/google/callback',
      });

      const [user] = await appRef.app.db
        .select()
        .from(users)
        .where(eq(users.email, EMAIL))
        .limit(1);

      expect(user).toBeDefined();
      expect(user.password_hash).toBeNull();
    });

    it('leaves the new rider without a Selected Location', async () => {
      await appRef.app.inject({
        method: 'GET',
        url: '/auth/google/callback',
      });

      const [user] = await appRef.app.db
        .select()
        .from(users)
        .where(eq(users.email, EMAIL))
        .limit(1);
      const selectedLocations = await appRef.app.db
        .select()
        .from(selected_locations)
        .where(eq(selected_locations.user_id, user.id));

      expect(selectedLocations).toEqual([]);
    });

    it('creates oauth account linked to new user', async () => {
      await appRef.app.inject({
        method: 'GET',
        url: '/auth/google/callback',
      });

      const [user] = await appRef.app.db
        .select()
        .from(users)
        .where(eq(users.email, EMAIL))
        .limit(1);

      const [oauthAccount] = await appRef.app.db
        .select()
        .from(oauth_accounts)
        .where(eq(oauth_accounts.provider_user_id, GOOGLE_SUB))
        .limit(1);

      expect(oauthAccount).toBeDefined();
      expect(oauthAccount?.user_id).toBe(user?.id);
    });

    it('redirects and sets auth cookies', async () => {
      const response = await appRef.app.inject({
        method: 'GET',
        url: '/auth/google/callback',
      });

      expect(response.cookies.find((c) => c.name === 'accessToken')).toBeDefined();
      expect(response.cookies.find((c) => c.name === 'refreshToken')).toBeDefined();
      expect(response.statusCode).toBe(302);
    });
  });

  describe('when Google sends the email in a different letter case', () => {
    beforeEach(async () => {
      (appRef.app as any).oauth2Google.userinfo = vi
        .fn()
        .mockResolvedValue({ sub: GOOGLE_SUB, email: 'Test@Example.com', email_verified: true });
      await appRef.app.db.insert(users).values({ email: EMAIL, password_hash: 'hashed' });
    });

    it('links oauth account to existing user and creates no second user', async () => {
      await appRef.app.inject({
        method: 'GET',
        url: '/auth/google/callback',
      });

      const allUsers = await appRef.app.db.select().from(users);
      const [oauthAccount] = await appRef.app.db
        .select()
        .from(oauth_accounts)
        .where(eq(oauth_accounts.provider_user_id, GOOGLE_SUB))
        .limit(1);

      expect(allUsers).toHaveLength(1);
      expect(oauthAccount?.user_id).toBe(allUsers[0].id);
    });
  });

  describe('when Google did not verify the email', () => {
    const mockUserinfo = (userinfo: Record<string, unknown>) => {
      (appRef.app as any).oauth2Google.userinfo = vi.fn().mockResolvedValue(userinfo);
    };

    const callback = () => appRef.app.inject({ method: 'GET', url: '/auth/google/callback' });

    it('refuses to link to an existing account', async () => {
      mockUserinfo({ sub: GOOGLE_SUB, email: EMAIL, email_verified: false });
      await appRef.app.db.insert(users).values({ email: EMAIL, password_hash: 'hashed' });

      const response = await callback();

      const oauthAccounts = await appRef.app.db.select().from(oauth_accounts);
      const [user] = await appRef.app.db.select().from(users).where(eq(users.email, EMAIL));

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({ type: 'OAUTH_EMAIL_NOT_VERIFIED' });
      expect(oauthAccounts).toEqual([]);
      expect(user.email_verified).toBe(false);
      expect(user.email_verified_at).toBeNull();
      expect(response.cookies).toEqual([]);
    });

    it('creates no user when no account exists', async () => {
      mockUserinfo({ sub: GOOGLE_SUB, email: EMAIL, email_verified: false });

      const response = await callback();

      const allUsers = await appRef.app.db.select().from(users);

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({ type: 'OAUTH_EMAIL_NOT_VERIFIED' });
      expect(allUsers).toEqual([]);
    });

    it('refuses when the field is missing', async () => {
      mockUserinfo({ sub: GOOGLE_SUB, email: EMAIL });

      const response = await callback();

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({ type: 'OAUTH_EMAIL_NOT_VERIFIED' });
    });

    it('refuses when the field is the string "true"', async () => {
      mockUserinfo({ sub: GOOGLE_SUB, email: EMAIL, email_verified: 'true' });

      const response = await callback();

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({ type: 'OAUTH_EMAIL_NOT_VERIFIED' });
    });

    it('refuses a returning Google user', async () => {
      mockUserinfo({ sub: GOOGLE_SUB, email: EMAIL, email_verified: false });
      const [user] = await appRef.app.db.insert(users).values({ email: EMAIL }).returning();
      await appRef.app.db.insert(oauth_accounts).values({
        provider: 'google',
        provider_user_id: GOOGLE_SUB,
        user_id: user.id,
      });

      const response = await callback();

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({ type: 'OAUTH_EMAIL_NOT_VERIFIED' });
      expect(response.cookies).toEqual([]);
    });
  });
});
