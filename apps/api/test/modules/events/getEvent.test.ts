import { describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';
import { newEvent } from '../../helpers/events.js';

describe('GET /events/:id', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);

  it('returns 404 when event does not exist', async () => {
    const response = await appRef.app.inject({
      method: 'GET',
      url: '/events/00000000-0000-0000-0000-000000000000',
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(404);
  });

  it('returns event when found', async () => {
    const body = newEvent({ user_id: auth.userId, title: 'Morning Ride', city: 'Warsaw', country: 'PL' });

    const createResponse = await appRef.app.inject({
      method: 'POST',
      url: '/events',
      body,
      cookies: { accessToken: auth.accessToken },
    });

    const eventId = createResponse.json().data.id as string;

    const response = await appRef.app.inject({
      method: 'GET',
      url: `/events/${eventId}`,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);

    const { data } = response.json();
    expect(data.id).toBe(eventId);
    expect(data.title).toBe('Morning Ride');
    expect(data.city).toBe('Warsaw');
    expect(data.country).toBe('PL');
    expect(data.creator.id).toBe(auth.userId);
    expect(data.creator.password_hash).toBeUndefined();
    expect(data.participants).toEqual([]);
  });
});
