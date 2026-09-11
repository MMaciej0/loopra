import { beforeEach, describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { registerUser, useAuthenticatedUser } from '../../helpers/auth.js';
import { newRide } from '../../helpers/rides.js';

describe('PATCH /rides/:id', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);
  const updateRideBody = {
    title: 'test with correct length',
  };

  it('throws 404 when ride does not exists', async () => {
    const response = await appRef.app.inject({
      method: 'PATCH',
      url: '/rides/00000000-0000-0000-0000-000000000000',
      body: updateRideBody,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(404);
  });

  it('returns 200 and updated ride under data key when body is correct', async () => {
    const rideResponse = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: newRide({ user_id: auth.userId, city: 'Warsaw', country: 'Poland' }),
      cookies: { accessToken: auth.accessToken },
    });

    const rideId = rideResponse.json().data.id as string;

    const response = await appRef.app.inject({
      method: 'PATCH',
      url: `/rides/${rideId}`,
      body: updateRideBody,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.title).toBe(updateRideBody.title);
  });

  describe('when ride does not belong to user', () => {
    let rideWhichNotBelongToUserId: string;

    beforeEach(async () => {
      // Create a second user and have them create an ride
      const otherUser = await registerUser(appRef.app, 'other@example.com');

      const rideResponse = await appRef.app.inject({
        method: 'POST',
        url: '/rides',
        body: newRide({ user_id: otherUser.userId, city: 'Warsaw', country: 'Poland' }),
        cookies: { accessToken: otherUser.accessToken },
      });

      rideWhichNotBelongToUserId = rideResponse.json().data.id as string;
    });

    it('throws 404', async () => {
      const response = await appRef.app.inject({
        method: 'PATCH',
        url: `/rides/${rideWhichNotBelongToUserId}`,
        body: updateRideBody,
        cookies: { accessToken: auth.accessToken },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('when user sends body that contain', () => {
    describe('ride end_time, no start_time and ride end_time is before start_time', () => {
      const rideStartTime = new Date(Date.now() + 6 * 60 * 60 * 1000);
      let rideId: string;

      beforeEach(async () => {
        const rideResponse = await appRef.app.inject({
          method: 'POST',
          url: '/rides',
          body: newRide({
            user_id: auth.userId,
            start_time: rideStartTime,
            city: 'Warsaw',
            country: 'Poland',
          }),
          cookies: { accessToken: auth.accessToken },
        });

        rideId = rideResponse.json().data.id as string;
      });

      it('throws 400', async () => {
        const response = await appRef.app.inject({
          method: 'PATCH',
          url: `/rides/${rideId}`,
          body: {
            end_time: new Date(rideStartTime.getTime() - 1000), // 1 second before start
          },
          cookies: { accessToken: auth.accessToken },
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('start_time less than 5 hours from now', () => {
      let rideId: string;

      beforeEach(async () => {
        const rideResponse = await appRef.app.inject({
          method: 'POST',
          url: '/rides',
          body: newRide({ user_id: auth.userId, city: 'Warsaw', country: 'Poland' }),
          cookies: { accessToken: auth.accessToken },
        });

        rideId = rideResponse.json().data.id as string;
      });

      it('throws 400', async () => {
        const response = await appRef.app.inject({
          method: 'PATCH',
          url: `/rides/${rideId}`,
          body: {
            start_time: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4h from now, below 5h threshold
          },
          cookies: { accessToken: auth.accessToken },
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('ride start_time, no end_time and existing ride end_time is before payload start_time', () => {
      const rideStartTime = new Date(Date.now() + 6 * 60 * 60 * 1000);
      const rideEndTime = new Date(rideStartTime.getTime() + 48 * 60 * 60 * 1000);
      let rideId: string;

      beforeEach(async () => {
        const rideResponse = await appRef.app.inject({
          method: 'POST',
          url: '/rides',
          body: newRide({
            user_id: auth.userId,
            start_time: rideStartTime,
            end_time: rideEndTime,
            city: 'Warsaw',
            country: 'Poland',
          }),
          cookies: { accessToken: auth.accessToken },
        });

        rideId = rideResponse.json().data.id as string;
      });

      it('throws 400', async () => {
        const response = await appRef.app.inject({
          method: 'PATCH',
          url: `/rides/${rideId}`,
          body: {
            start_time: rideEndTime,
          },
          cookies: { accessToken: auth.accessToken },
        });

        expect(response.statusCode).toBe(400);
      });
    });
  });
});
