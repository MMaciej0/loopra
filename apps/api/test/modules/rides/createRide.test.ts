import { describe, expect, it } from 'vitest';
import {
  BIKE_TYPES,
  DISTANCE_MAX_KM,
  DISTANCE_MIN_KM,
  DROP_POLICIES,
  EXPERIENCE_POLICIES,
  FORMATION_POLICIES,
  PACE_MAX_KMH,
  PACE_MIN_KMH,
  PACE_POLICIES,
} from '@loopra/domain';
import { useApp } from '../../helpers/app.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';

describe('POST /rides', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);

  const rideBody = {
    ride_type: 'casual',
    title: 'Warsaw Morning Ride',
    city: 'Warsaw',
    country: 'PL',
    start_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6h from now — clears the 5h validation
    bike_type: 'road',
    drop_policy: 'no_drop',
    pace_policy: 'slowest_rider',
    formation_policy: 'free',
    experience_policy: 'first_timers',
    max_participants: 10,
    is_private: false,
  };

  it('returns 403 when user email is not verified', async () => {
    const unverifiedToken = appRef.app.jwt.sign({ sub: auth.userId, email_verified: false });

    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: rideBody,
      cookies: { accessToken: unverifiedToken },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({ type: 'EMAIL_NOT_VERIFIED' });
  });

  it('returns 200 when correct body is sent', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: rideBody,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
  });

  it('sends start_time as an ISO string', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: rideBody,
      cookies: { accessToken: auth.accessToken },
    });

    const { data } = response.json();

    expect(data.start_time).toBe(rideBody.start_time);
    expect(data.end_time).toBeNull();
    expect(new Date(data.created_at).toISOString()).toBe(data.created_at);
    expect(new Date(data.updated_at).toISOString()).toBe(data.updated_at);
  });

  it('returns the ride with exactly the whitelisted keys', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: rideBody,
      cookies: { accessToken: auth.accessToken },
    });

    expect(Object.keys(response.json())).toEqual(['data']);
    expect(Object.keys(response.json().data).sort()).toEqual(
      [
        'average_pace_kmh',
        'bike_type',
        'city',
        'country',
        'created_at',
        'creator_id',
        'description',
        'distance_km',
        'drop_policy',
        'end_time',
        'experience_policy',
        'formation_policy',
        'full_address',
        'id',
        'is_private',
        'max_participants',
        'municipality',
        'pace_policy',
        'postal_code',
        'region',
        'ride_type',
        'route_id',
        'start_location',
        'start_location_name',
        'start_time',
        'status',
        'title',
        'updated_at',
      ].sort(),
    );
  });

  it('seats the creator as a participant', async () => {
    const createResponse = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: rideBody,
      cookies: { accessToken: auth.accessToken },
    });

    const rideId = createResponse.json().data.id as string;

    const response = await appRef.app.inject({
      method: 'GET',
      url: `/rides/${rideId}`,
      cookies: { accessToken: auth.accessToken },
    });

    const { participants } = response.json().data;
    expect(participants).toHaveLength(1);
    expect(participants[0].user_id).toBe(auth.userId);
  });

  it('returns 400 when max_participants is missing', async () => {
    const { max_participants: _omitted, ...body } = rideBody;

    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 when max_participants leaves no room beside the creator', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: { ...rideBody, max_participants: 1 },
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });

  it.each(BIKE_TYPES)('accepts bike_type %s', async (bike_type) => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: { ...rideBody, bike_type },
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
  });

  it('returns 400 when bike_type is missing', async () => {
    const { bike_type: _omitted, ...body } = rideBody;

    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 for unknown bike_type', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: { ...rideBody, bike_type: 'unicycle' },
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });

  it.each(DROP_POLICIES)('accepts drop_policy %s', async (drop_policy) => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: { ...rideBody, drop_policy },
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
  });

  it('returns 400 for unknown drop_policy', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: { ...rideBody, drop_policy: 'sweeper' },
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 when drop_policy is missing', async () => {
    const { drop_policy: _omitted, ...body } = rideBody;

    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });

  it.each(PACE_POLICIES.filter((p) => p !== 'leader'))(
    'accepts pace_policy %s',
    async (pace_policy) => {
      const response = await appRef.app.inject({
        method: 'POST',
        url: '/rides',
        body: { ...rideBody, pace_policy },
        cookies: { accessToken: auth.accessToken },
      });

      expect(response.statusCode).toBe(200);
    },
  );

  it('accepts pace_policy leader when average_pace_kmh is given', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: { ...rideBody, pace_policy: 'leader', average_pace_kmh: 28 },
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
  });

  it('returns 400 for pace_policy leader without average_pace_kmh', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: { ...rideBody, pace_policy: 'leader' },
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 when pace_policy is missing', async () => {
    const { pace_policy: _omitted, ...body } = rideBody;

    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });

  it.each([PACE_MIN_KMH - 1, PACE_MAX_KMH + 1])(
    'returns 400 for average_pace_kmh %s',
    async (average_pace_kmh) => {
      const response = await appRef.app.inject({
        method: 'POST',
        url: '/rides',
        body: { ...rideBody, pace_policy: 'leader', average_pace_kmh },
        cookies: { accessToken: auth.accessToken },
      });

      expect(response.statusCode).toBe(400);
    },
  );

  it.each([DISTANCE_MIN_KM - 1, DISTANCE_MAX_KM + 1])(
    'returns 400 for distance_km %s',
    async (distance_km) => {
      const response = await appRef.app.inject({
        method: 'POST',
        url: '/rides',
        body: { ...rideBody, distance_km },
        cookies: { accessToken: auth.accessToken },
      });

      expect(response.statusCode).toBe(400);
    },
  );

  it.each([PACE_MIN_KMH, PACE_MAX_KMH])(
    'accepts average_pace_kmh %s at the boundary',
    async (average_pace_kmh) => {
      const response = await appRef.app.inject({
        method: 'POST',
        url: '/rides',
        body: { ...rideBody, pace_policy: 'leader', average_pace_kmh },
        cookies: { accessToken: auth.accessToken },
      });

      expect(response.statusCode).toBe(200);
    },
  );

  it.each([DISTANCE_MIN_KM, DISTANCE_MAX_KM])(
    'accepts distance_km %s at the boundary',
    async (distance_km) => {
      const response = await appRef.app.inject({
        method: 'POST',
        url: '/rides',
        body: { ...rideBody, distance_km },
        cookies: { accessToken: auth.accessToken },
      });

      expect(response.statusCode).toBe(200);
    },
  );

  it.each(FORMATION_POLICIES)('accepts formation_policy %s', async (formation_policy) => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: { ...rideBody, formation_policy },
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
  });

  it('returns 400 for unknown formation_policy', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: { ...rideBody, formation_policy: 'echelon' },
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 when formation_policy is missing', async () => {
    const { formation_policy: _omitted, ...body } = rideBody;

    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });

  it.each(EXPERIENCE_POLICIES)('accepts experience_policy %s', async (experience_policy) => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: { ...rideBody, experience_policy },
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
  });

  it('returns 400 for unknown experience_policy', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: { ...rideBody, experience_policy: 'pro' },
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 when experience_policy is missing', async () => {
    const { experience_policy: _omitted, ...body } = rideBody;

    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(400);
  });
});
