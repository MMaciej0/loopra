import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { useApp } from '../../helpers/app.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';
import { users } from '../../../src/db/schema.js';

describe('GET /users/me', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);

  it('returns 401 when not authenticated', async () => {
    const response = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
    });

    expect(response.statusCode).toBe(401);
  });

  it('returns 404 when user has a valid token but account no longer exists', async () => {
    const ghostToken = appRef.app.jwt.sign({
      sub: '00000000-0000-0000-0000-000000000000',
      email_verified: true,
    });

    const response = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
      cookies: { accessToken: ghostToken },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ type: 'USER_NOT_FOUND' });
  });

  it('returns current user profile when authenticated', async () => {
    const response = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      user: { id: auth.userId, email: auth.email },
    });
  });

  it('serializes the current user as the wire DTO', async () => {
    const response = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
      cookies: { accessToken: auth.accessToken },
    });

    const { user } = response.json();

    expect(Object.keys(user).sort()).toEqual(
      [
        'created_at',
        'email',
        'email_verified',
        'favorite_city',
        'favorite_country',
        'favorite_location',
        'favorite_municipality',
        'favorite_postal_code',
        'favorite_region',
        'id',
        'location_prompt_dismissed_at',
        'username',
      ].sort(),
    );
    expect(user.created_at).toBe(new Date(user.created_at).toISOString());
    expect(user.location_prompt_dismissed_at).toBeNull();
  });

  it.each(['password_hash', 'email_verified_at', 'updated_at'])(
    'does not expose %s',
    async (column) => {
      const response = await appRef.app.inject({
        method: 'GET',
        url: '/users/me',
        cookies: { accessToken: auth.accessToken },
      });

      expect(response.json().user).not.toHaveProperty(column);
    },
  );

  it('does not expose password_hash on update', async () => {
    const response = await appRef.app.inject({
      method: 'PATCH',
      url: '/users/me',
      cookies: { accessToken: auth.accessToken },
      payload: { username: 'KrakowRider' },
    });

    expect(response.json().updatedUser).not.toHaveProperty('password_hash');
  });

  it('updates the current user profile', async () => {
    const response = await appRef.app.inject({
      method: 'PATCH',
      url: '/users/me',
      cookies: { accessToken: auth.accessToken },
      payload: {
        username: 'KrakowRider',
        favorite_location: { x: 19.931061973572554, y: 50.06231629701497 },
        favorite_city: 'Kraków',
        favorite_country: 'Poland',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().updatedUser).toMatchObject({
      id: auth.userId,
      username: 'KrakowRider',
      favorite_location: { x: 19.931061973572554, y: 50.06231629701497 },
      favorite_city: 'Kraków',
      favorite_country: 'Poland',
    });
  });

  it('dismisses the favourite location prompt', async () => {
    const response = await appRef.app.inject({
      method: 'PATCH',
      url: '/users/me',
      cookies: { accessToken: auth.accessToken },
      payload: { dismiss_location_prompt: true },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().updatedUser.location_prompt_dismissed_at).toEqual(expect.any(String));
  });

  it('returns null favourite location fields for a user who has not set one', async () => {
    const response = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user).toMatchObject({
      favorite_location: null,
      favorite_city: null,
      favorite_municipality: null,
      favorite_region: null,
      favorite_country: null,
      favorite_postal_code: null,
      location_prompt_dismissed_at: null,
    });
  });

  it('returns the stored favourite location once set', async () => {
    const dismissedAt = new Date('2026-01-15T10:00:00.000Z');

    await appRef.app.db
      .update(users)
      .set({
        favorite_location: { x: 19.931061973572554, y: 50.06231629701497 },
        favorite_city: 'Kraków',
        favorite_municipality: 'Kraków',
        favorite_region: 'Lesser Poland Voivodeship',
        favorite_country: 'Poland',
        favorite_postal_code: '31-234',
        location_prompt_dismissed_at: dismissedAt,
      })
      .where(eq(users.id, auth.userId));

    const response = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user).toMatchObject({
      favorite_location: { x: 19.931061973572554, y: 50.06231629701497 },
      favorite_city: 'Kraków',
      favorite_municipality: 'Kraków',
      favorite_region: 'Lesser Poland Voivodeship',
      favorite_country: 'Poland',
      favorite_postal_code: '31-234',
      location_prompt_dismissed_at: dismissedAt.toISOString(),
    });
  });
});
