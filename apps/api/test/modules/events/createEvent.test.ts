import { describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';

describe('POST /events', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);

  const eventBody = {
    ride_type: 'casual',
    title: 'Warsaw Morning Ride',
    city: 'Warsaw',
    country: 'PL',
    start_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6h from now — clears the 5h validation
    bike_type: 'road',
    is_private: false,
  };

  it('returns 403 when user email is not verified', async () => {
    const unverifiedToken = appRef.app.jwt.sign({ sub: auth.userId, email_verified: false });

    const response = await appRef.app.inject({
      method: 'POST',
      url: '/events',
      body: eventBody,
      cookies: { accessToken: unverifiedToken },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({ type: 'EMAIL_NOT_VERIFIED' });
  });

  it('returns 200 when correct body is sent', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/events',
      body: eventBody,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
  });

  it.each(['road', 'gravel', 'mtb', 'trekking', 'urban', 'electric', 'cyclocross', 'tt'])(
    'accepts bike_type %s',
    async (bike_type) => {
      const response = await appRef.app.inject({
        method: 'POST',
        url: '/events',
        body: { ...eventBody, bike_type },
        cookies: { accessToken: auth.accessToken },
      });

      expect(response.statusCode).toBe(200);
    },
  );

  it('returns 400 for unknown bike_type', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/events',
      body: { ...eventBody, bike_type: 'unicycle' },
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });
});
