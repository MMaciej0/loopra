import { describe, expect, it, beforeEach } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { registerUser, useAuthenticatedUser } from '../../helpers/auth.js';
import { newEvent } from '../../helpers/events.js';
import { event_participants } from '../../../src/db/schema.js';

describe('DELETE /events/:id', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);

  it("returns 404 when event doesn't exist", async () => {
    const response = await appRef.app.inject({
      method: 'DELETE',
      url: `/events/00000000-0000-0000-0000-000000000000`,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(404);
  });

  it('returns deleted event when event exists', async () => {
    const eventResponse = await appRef.app.inject({
      method: 'POST',
      url: '/events',
      body: newEvent({ user_id: auth.userId, city: 'Warsaw', country: 'Poland' }),
      cookies: { accessToken: auth.accessToken },
    });

    const eventId = eventResponse.json().data.id as string;

    const response = await appRef.app.inject({
      method: 'DELETE',
      url: `/events/${eventId}`,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.id).toBe(eventId);
  });

  describe('when event does not belong to user', () => {
    const otherUser = useAuthenticatedUser(appRef, 'other@example.com');

    it('throws 404', async () => {
      const newEventResponse = await appRef.app.inject({
        method: 'POST',
        url: '/events',
        body: newEvent({ user_id: otherUser.userId, city: 'Warsaw', country: 'Poland' }),
        cookies: { accessToken: otherUser.accessToken },
      });

      const deleteResponse = await appRef.app.inject({
        method: 'DELETE',
        url: `/events/${newEventResponse.json().data.id}`,
        cookies: { accessToken: auth.accessToken },
      });

      expect(deleteResponse.statusCode).toBe(404);
    });
  });

  describe('when event got participants', () => {
    let eventId: string;

    beforeEach(async () => {
      const eventResponse = await appRef.app.inject({
        method: 'POST',
        url: '/events',
        body: newEvent({ user_id: auth.userId, city: 'Warsaw', country: 'Poland' }),
        cookies: { accessToken: auth.accessToken },
      });

      eventId = eventResponse.json().data.id as string;

      const participant = await registerUser(appRef.app, 'participant@example.com');

      await appRef.app.db.insert(event_participants).values({
        event_id: eventId,
        user_id: participant.userId,
      });
    });

    it('throws 400', async () => {
      const response = await appRef.app.inject({
        method: 'DELETE',
        url: `/events/${eventId}`,
        cookies: { accessToken: auth.accessToken },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
