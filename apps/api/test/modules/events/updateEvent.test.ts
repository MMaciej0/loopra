import { beforeEach, describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { registerUser, useAuthenticatedUser } from '../../helpers/auth.js';
import { newEvent } from '../../helpers/events.js';

describe('PATCH /events/:id', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);
  const updateEventBody = {
    title: 'test with correct length',
  };

  it('throws 404 when event does not exists', async () => {
    const response = await appRef.app.inject({
      method: 'PATCH',
      url: '/events/00000000-0000-0000-0000-000000000000',
      body: updateEventBody,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(404);
  });

  it('returns 200 and updated event under data key when body is correct', async () => {
    const eventResponse = await appRef.app.inject({
      method: 'POST',
      url: '/events',
      body: newEvent({ user_id: auth.userId, city: 'Warsaw', country: 'Poland' }),
      cookies: { accessToken: auth.accessToken },
    });

    const eventId = eventResponse.json().data.id as string;

    const response = await appRef.app.inject({
      method: 'PATCH',
      url: `/events/${eventId}`,
      body: updateEventBody,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.title).toBe(updateEventBody.title);
  });

  describe('when event does not belong to user', () => {
    let eventWhichNotBelongToUserId: string;

    beforeEach(async () => {
      // Create a second user and have them create an event
      const otherUser = await registerUser(appRef.app, 'other@example.com');

      const eventResponse = await appRef.app.inject({
        method: 'POST',
        url: '/events',
        body: newEvent({ user_id: otherUser.userId, city: 'Warsaw', country: 'Poland' }),
        cookies: { accessToken: otherUser.accessToken },
      });

      eventWhichNotBelongToUserId = eventResponse.json().data.id as string;
    });

    it('throws 404', async () => {
      const response = await appRef.app.inject({
        method: 'PATCH',
        url: `/events/${eventWhichNotBelongToUserId}`,
        body: updateEventBody,
        cookies: { accessToken: auth.accessToken },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('when user sends body that contain', () => {
    describe('event end_time, no start_time and event end_time is before start_time', () => {
      const eventStartTime = new Date(Date.now() + 6 * 60 * 60 * 1000);
      let eventId: string;

      beforeEach(async () => {
        const eventResponse = await appRef.app.inject({
          method: 'POST',
          url: '/events',
          body: newEvent({
            user_id: auth.userId,
            start_time: eventStartTime,
            city: 'Warsaw',
            country: 'Poland',
          }),
          cookies: { accessToken: auth.accessToken },
        });

        eventId = eventResponse.json().data.id as string;
      });

      it('throws 400', async () => {
        const response = await appRef.app.inject({
          method: 'PATCH',
          url: `/events/${eventId}`,
          body: {
            end_time: new Date(eventStartTime.getTime() - 1000), // 1 second before start
          },
          cookies: { accessToken: auth.accessToken },
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('start_time less than 5 hours from now', () => {
      let eventId: string;

      beforeEach(async () => {
        const eventResponse = await appRef.app.inject({
          method: 'POST',
          url: '/events',
          body: newEvent({ user_id: auth.userId, city: 'Warsaw', country: 'Poland' }),
          cookies: { accessToken: auth.accessToken },
        });

        eventId = eventResponse.json().data.id as string;
      });

      it('throws 400', async () => {
        const response = await appRef.app.inject({
          method: 'PATCH',
          url: `/events/${eventId}`,
          body: {
            start_time: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4h from now, below 5h threshold
          },
          cookies: { accessToken: auth.accessToken },
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('event start_time, no end_time and existing event end_time is before payload start_time', () => {
      const eventStartTime = new Date(Date.now() + 6 * 60 * 60 * 1000);
      const eventEndTime = new Date(eventStartTime.getTime() + 48 * 60 * 60 * 1000);
      let eventId: string;

      beforeEach(async () => {
        const eventResponse = await appRef.app.inject({
          method: 'POST',
          url: '/events',
          body: newEvent({
            user_id: auth.userId,
            start_time: eventStartTime,
            end_time: eventEndTime,
            city: 'Warsaw',
            country: 'Poland',
          }),
          cookies: { accessToken: auth.accessToken },
        });

        eventId = eventResponse.json().data.id as string;
      });

      it('throws 400', async () => {
        const response = await appRef.app.inject({
          method: 'PATCH',
          url: `/events/${eventId}`,
          body: {
            start_time: eventEndTime,
          },
          cookies: { accessToken: auth.accessToken },
        });

        expect(response.statusCode).toBe(400);
      });
    });
  });
});
