import { describe, expect, it, beforeEach } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { registerUser, useAuthenticatedUser } from '../../helpers/auth.js';
import { newRide } from '../../helpers/rides.js';
import { ride_participants } from '../../../src/db/schema.js';

describe('DELETE /rides/:id', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);

  it("returns 404 when ride doesn't exist", async () => {
    const response = await appRef.app.inject({
      method: 'DELETE',
      url: `/rides/00000000-0000-0000-0000-000000000000`,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(404);
  });

  it('returns deleted ride when ride exists', async () => {
    const rideResponse = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: newRide({ user_id: auth.userId, city: 'Warsaw', country: 'Poland' }),
      cookies: { accessToken: auth.accessToken },
    });

    const rideId = rideResponse.json().data.id as string;

    const response = await appRef.app.inject({
      method: 'DELETE',
      url: `/rides/${rideId}`,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.id).toBe(rideId);
  });

  describe('when ride does not belong to user', () => {
    const otherUser = useAuthenticatedUser(appRef, 'other@example.com');

    it('throws 404', async () => {
      const newRideResponse = await appRef.app.inject({
        method: 'POST',
        url: '/rides',
        body: newRide({ user_id: otherUser.userId, city: 'Warsaw', country: 'Poland' }),
        cookies: { accessToken: otherUser.accessToken },
      });

      const deleteResponse = await appRef.app.inject({
        method: 'DELETE',
        url: `/rides/${newRideResponse.json().data.id}`,
        cookies: { accessToken: auth.accessToken },
      });

      expect(deleteResponse.statusCode).toBe(404);
    });
  });

  describe('when ride got participants', () => {
    let rideId: string;

    beforeEach(async () => {
      const rideResponse = await appRef.app.inject({
        method: 'POST',
        url: '/rides',
        body: newRide({ user_id: auth.userId, city: 'Warsaw', country: 'Poland' }),
        cookies: { accessToken: auth.accessToken },
      });

      rideId = rideResponse.json().data.id as string;

      const participant = await registerUser(appRef.app, 'participant@example.com');

      await appRef.app.db.insert(ride_participants).values({
        ride_id: rideId,
        user_id: participant.userId,
      });
    });

    it('throws 400', async () => {
      const response = await appRef.app.inject({
        method: 'DELETE',
        url: `/rides/${rideId}`,
        cookies: { accessToken: auth.accessToken },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
