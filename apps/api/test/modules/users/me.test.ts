import { describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';
import { selected_locations } from '../../../src/db/schema.js';

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
      ['created_at', 'email', 'email_verified', 'id', 'selected_location', 'username'].sort(),
    );
    expect(user.created_at).toBe(new Date(user.created_at).toISOString());
  });

  it('serializes a stored Selected Location as the wire DTO', async () => {
    await appRef.app.db.insert(selected_locations).values({
      user_id: auth.userId,
      location: { x: 20.03, y: 50.07 },
      city: 'Kraków',
      country: 'Poland',
    });

    const response = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
      cookies: { accessToken: auth.accessToken },
    });

    expect(Object.keys(response.json().user.selected_location).sort()).toEqual(
      ['city', 'country', 'district', 'location', 'municipality', 'postal_code', 'region'].sort(),
    );
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
      payload: { username: 'KrakowRider' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().updatedUser).toMatchObject({
      id: auth.userId,
      username: 'KrakowRider',
      selected_location: null,
    });
  });

  it('rejects an empty update', async () => {
    const response = await appRef.app.inject({
      method: 'PATCH',
      url: '/users/me',
      cookies: { accessToken: auth.accessToken },
      payload: {},
    });

    expect(response.statusCode).toBe(400);
  });

  it('rejects an update carrying only the retired favourite fields', async () => {
    const response = await appRef.app.inject({
      method: 'PATCH',
      url: '/users/me',
      cookies: { accessToken: auth.accessToken },
      payload: {
        favorite_location: { x: 21.017532, y: 52.237049 },
        favorite_city: 'Warsaw',
        favorite_country: 'Poland',
        favorite_location_chosen: true,
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns no Selected Location for a rider who has not picked one', async () => {
    const response = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user.selected_location).toBeNull();
  });

  it('returns the stored Selected Location', async () => {
    const stored = {
      location: { x: 19.931061973572554, y: 50.06231629701497 },
      city: 'Kraków',
      district: 'Stare Miasto',
      municipality: 'Kraków',
      region: 'Lesser Poland Voivodeship',
      country: 'Poland',
      postal_code: '31-234',
    };
    await appRef.app.db.insert(selected_locations).values({ user_id: auth.userId, ...stored });

    const response = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user.selected_location).toEqual(stored);
  });
});
