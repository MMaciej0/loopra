import { describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { useApp } from '../../helpers/app.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';
import { newRide } from '../../helpers/rides.js';
import { ride_participants, rides } from '../../../src/db/schema.js';

describe('DELETE /rides/:id/leave', () => {
  const appRef = useApp();
  const creatorAuth = useAuthenticatedUser(appRef);
  const participantAuth = useAuthenticatedUser(appRef, 'participant@example.com');

  it('returns 404 when not a participant', async () => {
    const rideResponse = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: newRide({ user_id: creatorAuth.userId, city: 'Warsaw', country: 'PL' }),
      cookies: { accessToken: creatorAuth.accessToken },
    });

    const rideId = rideResponse.json().data.id as string;

    const response = await appRef.app.inject({
      method: 'DELETE',
      url: `/rides/${rideId}/leave`,
      cookies: { accessToken: participantAuth.accessToken },
    });

    expect(response.statusCode).toBe(404);
  });

  it('returns 200 and removes participant when joined', async () => {
    const rideResponse = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: newRide({ user_id: creatorAuth.userId, city: 'Warsaw', country: 'PL' }),
      cookies: { accessToken: creatorAuth.accessToken },
    });

    const rideId = rideResponse.json().data.id as string;

    await appRef.app.inject({
      method: 'POST',
      url: `/rides/${rideId}/join`,
      cookies: { accessToken: participantAuth.accessToken },
    });

    const response = await appRef.app.inject({
      method: 'DELETE',
      url: `/rides/${rideId}/leave`,
      cookies: { accessToken: participantAuth.accessToken },
    });

    expect(response.statusCode).toBe(200);
    const { data } = response.json();
    expect(data.ride_id).toBe(rideId);
    expect(data.user_id).toBe(participantAuth.userId);
  });

  it('returns 400 when the creator tries to leave their own ride', async () => {
    const rideResponse = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: newRide({ user_id: creatorAuth.userId, city: 'Warsaw', country: 'PL' }),
      cookies: { accessToken: creatorAuth.accessToken },
    });

    const rideId = rideResponse.json().data.id as string;

    const response = await appRef.app.inject({
      method: 'DELETE',
      url: `/rides/${rideId}/leave`,
      cookies: { accessToken: creatorAuth.accessToken },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ type: 'CREATOR_CANNOT_LEAVE' });
  });

  it('refuses to leave a ride that has already started', async () => {
    const rideResponse = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: newRide({ user_id: creatorAuth.userId, city: 'Warsaw', country: 'PL' }),
      cookies: { accessToken: creatorAuth.accessToken },
    });

    const rideId = rideResponse.json().data.id as string;

    await appRef.app.inject({
      method: 'POST',
      url: `/rides/${rideId}/join`,
      cookies: { accessToken: participantAuth.accessToken },
    });

    await appRef.app.db
      .update(rides)
      .set({ start_time: new Date(Date.now() - 60 * 1000) })
      .where(eq(rides.id, rideId));

    const response = await appRef.app.inject({
      method: 'DELETE',
      url: `/rides/${rideId}/leave`,
      cookies: { accessToken: participantAuth.accessToken },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ type: 'RIDE_ALREADY_STARTED' });

    const participants = await appRef.app.db
      .select()
      .from(ride_participants)
      .where(
        and(
          eq(ride_participants.ride_id, rideId),
          eq(ride_participants.user_id, participantAuth.userId),
        ),
      );

    expect(participants).toHaveLength(1);
  });
});
