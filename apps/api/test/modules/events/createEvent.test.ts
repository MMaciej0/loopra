import { describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';

describe('POST /events', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);

  const eventBody = {
    type: 'trip',
    title: 'Warsaw Morning Ride',
    city: 'Warsaw',
    country: 'PL',
    start_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6h from now — clears the 5h validation
    bike_type: 'road',
    is_private: false,
  };

  it('returns 200 when correct body is sent', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/events',
      body: eventBody,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
  });
});
