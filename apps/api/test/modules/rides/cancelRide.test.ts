import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { ERROR_TYPES } from '@loopra/domain';
import { useApp } from '../../helpers/app.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';
import { newRide } from '../../helpers/rides.js';
import { rides } from '../../../src/db/schema.js';

describe('POST /rides/:id/cancel', () => {
  const appRef = useApp();
  const organiserAuth = useAuthenticatedUser(appRef);
  const participantAuth = useAuthenticatedUser(appRef, 'participant@example.com');
  const strangerAuth = useAuthenticatedUser(appRef, 'stranger@example.com');

  const createRide = async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: newRide({ user_id: organiserAuth.userId }),
      cookies: { accessToken: organiserAuth.accessToken },
    });

    return response.json().data.id as string;
  };

  const join = (rideId: string, accessToken: string) =>
    appRef.app.inject({
      method: 'POST',
      url: `/rides/${rideId}/join`,
      cookies: { accessToken },
    });

  const cancel = (rideId: string, accessToken: string) =>
    appRef.app.inject({
      method: 'POST',
      url: `/rides/${rideId}/cancel`,
      cookies: { accessToken },
    });

  const getRide = (rideId: string, accessToken = strangerAuth.accessToken) =>
    appRef.app.inject({ method: 'GET', url: `/rides/${rideId}`, cookies: { accessToken } });

  const participantIds = async (rideId: string) => {
    const response = await getRide(rideId);
    const participants = response.json().data.participants as { user: { id: string } }[];

    return participants.map((participant) => participant.user.id).sort();
  };

  it('returns 401 without login', async () => {
    const rideId = await createRide();

    const response = await appRef.app.inject({ method: 'POST', url: `/rides/${rideId}/cancel` });

    expect(response.statusCode).toBe(401);
  });

  it("returns 404 when the ride doesn't exist", async () => {
    const response = await cancel(
      '00000000-0000-0000-0000-000000000000',
      organiserAuth.accessToken,
    );

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ type: ERROR_TYPES.RIDE_NOT_FOUND });
  });

  it('returns 404 RIDE_NOT_FOUND for a malformed id', async () => {
    const response = await cancel('abc', organiserAuth.accessToken);

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ type: ERROR_TYPES.RIDE_NOT_FOUND });
  });

  it('cancels a ride nobody else has joined and returns it', async () => {
    const rideId = await createRide();

    const response = await cancel(rideId, organiserAuth.accessToken);

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toMatchObject({ id: rideId, status: 'cancelled' });
  });

  it('cancels a ride other riders have joined and keeps the participant list', async () => {
    const rideId = await createRide();
    await join(rideId, participantAuth.accessToken);
    const before = await participantIds(rideId);

    const response = await cancel(rideId, organiserAuth.accessToken);

    expect(response.statusCode).toBe(200);
    expect(before).toEqual([organiserAuth.userId, participantAuth.userId].sort());
    expect(await participantIds(rideId)).toEqual(before);
  });

  it('returns the cancelled ride from GET /rides/:id to anyone', async () => {
    const rideId = await createRide();
    await cancel(rideId, organiserAuth.accessToken);

    const response = await getRide(rideId);

    expect(response.statusCode).toBe(200);
    expect(response.json().data.status).toBe('cancelled');
  });

  it('answers 404 to a rider who is not the organiser, and the ride stays published', async () => {
    const rideId = await createRide();
    await join(rideId, participantAuth.accessToken);

    const asParticipant = await cancel(rideId, participantAuth.accessToken);
    const asStranger = await cancel(rideId, strangerAuth.accessToken);

    expect(asParticipant.statusCode).toBe(404);
    expect(asParticipant.json()).toMatchObject({ type: ERROR_TYPES.RIDE_NOT_FOUND });
    expect(asStranger.statusCode).toBe(404);
    expect((await getRide(rideId)).json().data.status).toBe('published');
  });

  it('refuses to cancel a ride that is already cancelled', async () => {
    const rideId = await createRide();
    await cancel(rideId, organiserAuth.accessToken);

    const response = await cancel(rideId, organiserAuth.accessToken);

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ type: 'RIDE_CANCELLED' });
  });

  it('refuses to cancel a ride that has already started', async () => {
    const rideId = await createRide();
    await appRef.app.db
      .update(rides)
      .set({ start_time: new Date(Date.now() - 60 * 1000) })
      .where(eq(rides.id, rideId));

    const response = await cancel(rideId, organiserAuth.accessToken);

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ type: ERROR_TYPES.RIDE_ALREADY_STARTED });
    expect((await getRide(rideId)).json().data.status).toBe('published');
  });

  describe('after a cancel', () => {
    it('refuses a join', async () => {
      const rideId = await createRide();
      await cancel(rideId, organiserAuth.accessToken);

      const response = await join(rideId, participantAuth.accessToken);

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({ type: 'RIDE_CANCELLED' });
      expect(await participantIds(rideId)).toEqual([organiserAuth.userId]);
    });

    it('refuses a leave', async () => {
      const rideId = await createRide();
      await join(rideId, participantAuth.accessToken);
      await cancel(rideId, organiserAuth.accessToken);

      const response = await appRef.app.inject({
        method: 'DELETE',
        url: `/rides/${rideId}/leave`,
        cookies: { accessToken: participantAuth.accessToken },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({ type: 'RIDE_CANCELLED' });
      expect(await participantIds(rideId)).toEqual(
        [organiserAuth.userId, participantAuth.userId].sort(),
      );
    });

    it('refuses an edit', async () => {
      const rideId = await createRide();
      await cancel(rideId, organiserAuth.accessToken);

      const response = await appRef.app.inject({
        method: 'PATCH',
        url: `/rides/${rideId}`,
        body: { title: 'a new title for the ride' },
        cookies: { accessToken: organiserAuth.accessToken },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({ type: 'RIDE_CANCELLED' });
      expect((await getRide(rideId)).json().data.title).toBe('Test Ride');
    });

    it('leaves the ride out of the list and the markers', async () => {
      const rideId = await createRide();
      await appRef.app.db
        .update(rides)
        .set({ start_location: { x: 21.0122, y: 52.2297 } })
        .where(eq(rides.id, rideId));
      const browse = (url: string) =>
        appRef.app.inject({
          method: 'GET',
          url,
          query: { bbox: '20.9,52.1,21.1,52.3' },
          cookies: { accessToken: strangerAuth.accessToken },
        });

      const listBefore = await browse('/rides');
      const markersBefore = await browse('/rides/markers');
      await cancel(rideId, organiserAuth.accessToken);
      const listAfter = await browse('/rides');
      const markersAfter = await browse('/rides/markers');

      expect(listBefore.json().data).toHaveLength(1);
      expect(markersBefore.json().data).toHaveLength(1);
      expect(listAfter.json().data).toHaveLength(0);
      expect(markersAfter.json().data).toHaveLength(0);
    });
  });

  it('leaves no DELETE /rides/:id route', async () => {
    const rideId = await createRide();

    const response = await appRef.app.inject({
      method: 'DELETE',
      url: `/rides/${rideId}`,
      cookies: { accessToken: organiserAuth.accessToken },
    });

    expect(response.statusCode).toBe(404);
    expect((await getRide(rideId)).statusCode).toBe(200);
  });
});
