import { describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';
import { newRide } from '../../helpers/rides.js';
import { ride_participants } from '../../../src/db/schema.js';

describe('POST /rides/:rideId/join', () => {
  const appRef = useApp();
  const creatorAuth = useAuthenticatedUser(appRef);
  const participantAuth = useAuthenticatedUser(appRef, 'participant@example.com');
  const exceedingParticipantAuth = useAuthenticatedUser(appRef, 'participant2@example.com');

  it("returns 404 when ride doesn't exist", async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: `/rides/00000000-0000-0000-0000-000000000000/join`,
      cookies: { accessToken: participantAuth.accessToken },
    });

    expect(response.statusCode).toBe(404);
  });

  it('returns 200 when ride exists and user is not creator of ride and existing participant', async () => {
    const rideResponse = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: newRide({ user_id: creatorAuth.userId, city: 'Warsaw', country: 'Poland' }),
      cookies: { accessToken: creatorAuth.accessToken },
    });

    const rideId = rideResponse.json().data.id as string;

    const response = await appRef.app.inject({
      method: 'POST',
      url: `/rides/${rideId}/join`,
      cookies: { accessToken: participantAuth.accessToken },
    });

    expect(response.statusCode).toBe(200);
  });

  it('returns 400 when requested user is creator of ride', async () => {
    const rideResponse = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: newRide({ user_id: creatorAuth.userId, city: 'Warsaw', country: 'Poland' }),
      cookies: { accessToken: creatorAuth.accessToken },
    });

    const rideId = rideResponse.json().data.id as string;

    const response = await appRef.app.inject({
      method: 'POST',
      url: `/rides/${rideId}/join`,
      cookies: { accessToken: creatorAuth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 when user is already participant of ride', async () => {
    const rideResponse = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: newRide({ user_id: creatorAuth.userId, city: 'Warsaw', country: 'Poland' }),
      cookies: { accessToken: creatorAuth.accessToken },
    });

    const rideId = rideResponse.json().data.id as string;

    await appRef.app.db.insert(ride_participants).values({
      ride_id: rideId,
      user_id: participantAuth.userId,
    });

    const response = await appRef.app.inject({
      method: 'POST',
      url: `/rides/${rideId}/join`,
      cookies: { accessToken: participantAuth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 when join request user exceeds max participants', async () => {
    const rideResponse = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: newRide({
        user_id: creatorAuth.userId,
        city: 'Warsaw',
        country: 'Poland',
        // the creator holds one of these two seats
        max_participants: 2,
      }),
      cookies: { accessToken: creatorAuth.accessToken },
    });

    const rideId = rideResponse.json().data.id as string;

    await appRef.app.inject({
      method: 'POST',
      url: `/rides/${rideId}/join`,
      cookies: { accessToken: participantAuth.accessToken },
    });

    const response = await appRef.app.inject({
      method: 'POST',
      url: `/rides/${rideId}/join`,
      cookies: { accessToken: exceedingParticipantAuth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });
});
