import { describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';
import { newRide } from '../../helpers/rides.js';

describe('GET /rides/:id', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);

  it('returns 404 when ride does not exist', async () => {
    const response = await appRef.app.inject({
      method: 'GET',
      url: '/rides/00000000-0000-0000-0000-000000000000',
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(404);
  });

  it('returns ride when found', async () => {
    const body = newRide({
      user_id: auth.userId,
      title: 'Morning Ride',
      city: 'Warsaw',
      country: 'PL',
    });

    const createResponse = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body,
      cookies: { accessToken: auth.accessToken },
    });

    const rideId = createResponse.json().data.id as string;

    const response = await appRef.app.inject({
      method: 'GET',
      url: `/rides/${rideId}`,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);

    const { data } = response.json();
    expect(data.id).toBe(rideId);
    expect(data.title).toBe('Morning Ride');
    expect(data.city).toBe('Warsaw');
    expect(data.country).toBe('PL');
    expect(data.creator.id).toBe(auth.userId);
    expect(data.creator.password_hash).toBeUndefined();
    expect(data.participants).toHaveLength(1);
    expect(data.participants[0].user_id).toBe(auth.userId);
  });

  it('does not expose rider emails on the creator or participants', async () => {
    const body = newRide({ user_id: auth.userId, city: 'Warsaw', country: 'PL' });

    const createResponse = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body,
      cookies: { accessToken: auth.accessToken },
    });

    const response = await appRef.app.inject({
      method: 'GET',
      url: `/rides/${createResponse.json().data.id}`,
      cookies: { accessToken: auth.accessToken },
    });

    const { data } = response.json();

    expect(Object.keys(data.creator).sort()).toEqual(['id', 'username']);
    expect(Object.keys(data.participants[0].user).sort()).toEqual(['id', 'username']);
    expect(JSON.stringify(data)).not.toContain(auth.email);
  });
});
