import { describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { useApp } from '../../helpers/app.js';
import { users } from '../../../src/db/schema.js';

const createGuest = (app: ReturnType<typeof useApp>['app']) =>
  app.inject({ method: 'POST', url: '/auth/guest' });

describe('POST /auth/guest on staging', () => {
  const appRef = useApp({ appEnv: 'staging' });

  it('creates a verified guest with no password and sets auth cookies', async () => {
    const response = await createGuest(appRef.app);

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(Object.keys(body)).toEqual(['user']);
    expect(Object.keys(body.user).sort()).toEqual(['email', 'email_verified', 'id', 'username']);
    expect(body.user.email).toMatch(/^guest-[0-9a-f]+@guest\.loopra\.cc$/);
    expect(body.user.email_verified).toBe(true);
    expect(body.user.username).toMatch(/^guest-[0-9a-f]{4}$/);

    const [user] = await appRef.app.db.select().from(users).where(eq(users.id, body.user.id));
    expect(user.is_guest).toBe(true);
    expect(user.password_hash).toBeNull();
    expect(user.email_verified).toBe(true);
    expect(user.email_verified_at).toBeInstanceOf(Date);
    expect(user.username).toBe(body.user.username);

    const accessToken = response.cookies.find((c) => c.name === 'accessToken');
    const refreshToken = response.cookies.find((c) => c.name === 'refreshToken');
    expect(accessToken?.httpOnly).toBe(true);
    expect(refreshToken?.value).toMatch(/^[0-9a-f-]{36}\.[0-9a-f]{64}$/);
  });

  it('logs the guest in as a verified rider who is a guest', async () => {
    const response = await createGuest(appRef.app);
    const accessToken = response.cookies.find((c) => c.name === 'accessToken')!.value;

    expect(appRef.app.jwt.verify(accessToken)).toMatchObject({ email_verified: true });

    const me = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
      cookies: { accessToken },
    });

    expect(me.json().user).toMatchObject({
      is_guest: true,
      has_password: false,
      email_verified: true,
      selected_location: null,
    });
  });

  it('creates a new account on every call', async () => {
    const first = await createGuest(appRef.app);
    const second = await createGuest(appRef.app);

    expect(first.json().user.id).not.toBe(second.json().user.id);
    expect(first.json().user.email).not.toBe(second.json().user.email);
    expect(await appRef.app.db.select().from(users)).toHaveLength(2);
  });

  it('returns 429 after too many guests from one IP', async () => {
    const RATE_LIMIT = 5;

    for (let i = 1; i <= RATE_LIMIT; i++) {
      expect((await createGuest(appRef.app)).statusCode).toBe(200);
    }

    const refused = await createGuest(appRef.app);

    expect(refused.statusCode).toBe(429);
    expect(refused.json().type).toBe('RATE_LIMIT_EXCEEDED');
    expect(await appRef.app.db.select().from(users)).toHaveLength(RATE_LIMIT);
  });
});
