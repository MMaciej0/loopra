import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { useApp } from '../../helpers/app.js';
import { createMultipleRandomRides, newRide } from '../../helpers/rides.js';
import { rides } from '../../../src/db/schema.js';
import { registerUser, useAuthenticatedUser } from '../../helpers/auth.js';
import { buildFileUpload } from '../../helpers/multipart.js';

vi.mock('../../../src/utils/s3.js');

const routeFixture = readFileSync(new URL('../../fixtures/route.gpx', import.meta.url));

describe('GET /rides', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);
  const LIMIT = 20;

  const createRide = async (overrides: Record<string, unknown> = {}) => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: { ...newRide({ user_id: auth.userId }), ...overrides },
      cookies: { accessToken: auth.accessToken },
    });

    return response.json().data.id as string;
  };

  const listRides = async (query: Record<string, string> = {}) => {
    const response = await appRef.app.inject({
      method: 'GET',
      url: '/rides',
      query,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);

    return response.json();
  };

  it('returns first 20 records (limit) when cursor is not defined', async () => {
    await createMultipleRandomRides(appRef.app.db, LIMIT + 1, auth.userId);

    const response = await appRef.app.inject({
      method: 'GET',
      url: '/rides',
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.length).toBe(LIMIT);
    expect(response.json().nextCursor).toBeDefined();
  });

  it('returns next 20 records (limit) when cursor is defined', async () => {
    await createMultipleRandomRides(appRef.app.db, LIMIT * 2, auth.userId);

    const initialResponse = await appRef.app.inject({
      method: 'GET',
      url: '/rides',
      cookies: { accessToken: auth.accessToken },
    });

    const { nextCursor, data } = initialResponse.json();

    expect(data.length).toBe(LIMIT);
    expect(nextCursor).toBeDefined();

    const nextResponse = await appRef.app.inject({
      method: 'GET',
      url: '/rides',
      cookies: { accessToken: auth.accessToken },
      query: {
        cursor: nextCursor,
      },
    });

    expect(nextResponse.statusCode).toBe(200);
    expect(nextResponse.json().data.length).toBe(LIMIT);
    expect(nextResponse.json().nextCursor).toBe(null);
  });

  it('returns rides near Warsaw when Warsaw lat/long is provided', async () => {
    const warsawRide1 = newRide({
      user_id: auth.userId,
      start_location: { x: 21.01178, y: 52.22977 },
    });
    const warsawRide2 = newRide({
      user_id: auth.userId,
      start_location: { x: 21.01178, y: 52.22977 },
    });
    const tokyoRide = newRide({
      user_id: auth.userId,
      start_location: { x: 139.69171, y: 35.6895 },
    });

    await appRef.app.db.insert(rides).values([warsawRide1, warsawRide2, tokyoRide]).returning();

    const response = await appRef.app.inject({
      method: 'GET',
      url: '/rides',
      cookies: { accessToken: auth.accessToken },
      query: {
        lat: '52.22977',
        lng: '21.01178',
        radius_km: '1',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.length).toBe(2);
  });

  it('returns list items with exactly the whitelisted keys', async () => {
    await createRide();

    const { data } = await listRides();

    expect(Object.keys(data[0]).sort()).toEqual(
      [
        'average_pace_kmh',
        'bike_type',
        'city',
        'country',
        'created_at',
        'creator',
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
        'participant_count',
        'postal_code',
        'region',
        'ride_type',
        'route',
        'route_id',
        'start_location',
        'start_location_name',
        'start_time',
        'status',
        'title',
        'updated_at',
      ].sort(),
    );
    expect(data[0].creator).toEqual({ id: auth.userId, username: 'testuser' });
  });

  it('counts the Organiser as a participant and grows after a join', async () => {
    const rideId = await createRide();

    expect((await listRides()).data[0].participant_count).toBe(1);

    const other = await registerUser(appRef.app, 'other@example.com', 'password123', 'otheruser');
    const joinResponse = await appRef.app.inject({
      method: 'POST',
      url: `/rides/${rideId}/join`,
      cookies: { accessToken: other.accessToken },
    });
    expect(joinResponse.statusCode).toBe(200);

    expect((await listRides()).data[0].participant_count).toBe(2);
  });

  it('carries route distance and ascent without a profile, and null without a Route', async () => {
    const encoded = await buildFileUpload(routeFixture, 'warsaw-loop.gpx');
    const routeResponse = await appRef.app.inject({
      method: 'POST',
      url: '/routes',
      ...encoded,
      cookies: { accessToken: auth.accessToken },
    });
    const route = routeResponse.json().data;

    const withRouteId = await createRide({ route_id: route.id });
    const withoutRouteId = await createRide();

    const { data } = await listRides();
    const withRoute = data.find((ride: { id: string }) => ride.id === withRouteId);
    const withoutRoute = data.find((ride: { id: string }) => ride.id === withoutRouteId);

    expect(withRoute.route).toEqual({ distance_km: route.distance_km, ascent_m: route.ascent_m });
    expect(withoutRoute.route).toBeNull();
  });

  it('never lists private rides, with or without query parameters', async () => {
    const publicId = await createRide({ start_location: { x: 21.01178, y: 52.22977 } });
    await createRide({ is_private: true, start_location: { x: 21.01178, y: 52.22977 } });

    const unfiltered = await listRides();
    const filtered = await listRides({
      lat: '52.22977',
      lng: '21.01178',
      radius_km: '1',
      status: 'open',
    });

    expect(unfiltered.data.map((ride: { id: string }) => ride.id)).toEqual([publicId]);
    expect(filtered.data.map((ride: { id: string }) => ride.id)).toEqual([publicId]);
  });
});
