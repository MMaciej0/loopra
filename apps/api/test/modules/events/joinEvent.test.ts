import { describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';
import { newEvent } from '../../helpers/events.js';
import { event_participants } from '../../../src/db/schema.js';

describe('POST /events/:eventId/join', () => {
  const appRef = useApp();
  const creatorAuth = useAuthenticatedUser(appRef);
  const participantAuth = useAuthenticatedUser(appRef, 'participant@example.com');
  const exceedingParticipantAuth = useAuthenticatedUser(appRef, 'participant2@example.com');

  it("returns 404 when event doesn't exist", async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: `/events/00000000-0000-0000-0000-000000000000/join`,
      cookies: { accessToken: participantAuth.accessToken },
    });

    expect(response.statusCode).toBe(404);
  });

  it('returns 200 when event exists and user is not creator of event and existing participant', async () => {
    const eventResponse = await appRef.app.inject({
      method: 'POST',
      url: '/events',
      body: newEvent({ user_id: creatorAuth.userId, city: 'Warsaw', country: 'Poland' }),
      cookies: { accessToken: creatorAuth.accessToken },
    });

    const eventId = eventResponse.json().data.id as string;

    const response = await appRef.app.inject({
      method: 'POST',
      url: `/events/${eventId}/join`,
      cookies: { accessToken: participantAuth.accessToken },
    });

    expect(response.statusCode).toBe(200);
  });

  it('returns 400 when requested user is creator of event', async () => {
    const eventResponse = await appRef.app.inject({
      method: 'POST',
      url: '/events',
      body: newEvent({ user_id: creatorAuth.userId, city: 'Warsaw', country: 'Poland' }),
      cookies: { accessToken: creatorAuth.accessToken },
    });

    const eventId = eventResponse.json().data.id as string;

    const response = await appRef.app.inject({
      method: 'POST',
      url: `/events/${eventId}/join`,
      cookies: { accessToken: creatorAuth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 when user is already participant of event', async () => {
    const eventResponse = await appRef.app.inject({
      method: 'POST',
      url: '/events',
      body: newEvent({ user_id: creatorAuth.userId, city: 'Warsaw', country: 'Poland' }),
      cookies: { accessToken: creatorAuth.accessToken },
    });

    const eventId = eventResponse.json().data.id as string;

    await appRef.app.db.insert(event_participants).values({
      event_id: eventId,
      user_id: participantAuth.userId,
    });

    const response = await appRef.app.inject({
      method: 'POST',
      url: `/events/${eventId}/join`,
      cookies: { accessToken: participantAuth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 when join request user exceeds max participants', async () => {
    const eventResponse = await appRef.app.inject({
      method: 'POST',
      url: '/events',
      body: newEvent({
        user_id: creatorAuth.userId,
        city: 'Warsaw',
        country: 'Poland',
        max_participants: 1,
      }),
      cookies: { accessToken: creatorAuth.accessToken },
    });

    const eventId = eventResponse.json().data.id as string;

    await appRef.app.inject({
      method: 'POST',
      url: `/events/${eventId}/join`,
      cookies: { accessToken: participantAuth.accessToken },
    });

    const response = await appRef.app.inject({
      method: 'POST',
      url: `/events/${eventId}/join`,
      cookies: { accessToken: exceedingParticipantAuth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });
});
