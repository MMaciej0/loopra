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
    const ghostToken = appRef.app.jwt.sign({ sub: '00000000-0000-0000-0000-000000000000', email_verified: true });

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

  it('does not expose favourite location fields on another user profile', async () => {
    await appRef.app.db
      .update(users)
      .set({
        favorite_location: { x: 19.931061973572554, y: 50.06231629701497 },
        favorite_city: 'Kraków',
      })
      .where(eq(users.id, auth.userId));

    const response = await appRef.app.inject({
      method: 'GET',
      url: `/users/${auth.userId}`,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user).not.toHaveProperty('favorite_location');
    expect(response.json().user).not.toHaveProperty('favorite_city');
  });
});
