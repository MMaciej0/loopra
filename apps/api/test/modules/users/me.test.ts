import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { DEFAULT_FAVORITE_LOCATION } from '@loopra/domain';
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
        'favorite_location_chosen',
        'id',
        'username',
      ].sort(),
    );
    expect(user.created_at).toBe(new Date(user.created_at).toISOString());
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

  it('records the choice when a favourite location is patched, without the client sending it', async () => {
    const response = await appRef.app.inject({
      method: 'PATCH',
      url: '/users/me',
      cookies: { accessToken: auth.accessToken },
      payload: {
        favorite_location: { x: 21.017532, y: 52.237049 },
        favorite_city: 'Warsaw',
        favorite_country: 'Poland',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().updatedUser.favorite_location_chosen).toBe(true);
  });

  it('records the choice on its own, leaving the rider coordinates untouched', async () => {
    const response = await appRef.app.inject({
      method: 'PATCH',
      url: '/users/me',
      cookies: { accessToken: auth.accessToken },
      payload: { favorite_location_chosen: true },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().updatedUser).toMatchObject({
      favorite_location_chosen: true,
      favorite_location: DEFAULT_FAVORITE_LOCATION.favorite_location,
      favorite_city: 'Kraków',
      favorite_country: 'Poland',
    });
  });

  it('returns the seeded default favourite location for a freshly registered rider', async () => {
    const response = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user).toMatchObject({
      favorite_location: DEFAULT_FAVORITE_LOCATION.favorite_location,
      favorite_city: 'Kraków',
      favorite_country: 'Poland',
      favorite_municipality: null,
      favorite_region: null,
      favorite_postal_code: null,
      favorite_location_chosen: false,
    });
  });

  it('returns the stored favourite location once set', async () => {
    await appRef.app.db
      .update(users)
      .set({
        favorite_location: { x: 19.931061973572554, y: 50.06231629701497 },
        favorite_city: 'Kraków',
        favorite_municipality: 'Kraków',
        favorite_region: 'Lesser Poland Voivodeship',
        favorite_country: 'Poland',
        favorite_postal_code: '31-234',
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
    });
  });
});
