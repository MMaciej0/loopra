import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { bboxAround, formatBBox, RIDE_IDS_MAX, SEARCH_AREA_MAX_KM } from '@loopra/domain';
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

  const insertRides = async (...overrides: Record<string, unknown>[]) => {
    const inserted = await appRef.app.db
      .insert(rides)
      .values(overrides.map((override) => ({ ...newRide({ user_id: auth.userId }), ...override })))
      .returning({ id: rides.id });

    return inserted.map((ride) => ride.id);
  };

  const listIds = async (query: Record<string, string>) => {
    const { data } = await listRides(query);

    return data.map((ride: { id: string }) => ride.id);
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

  describe('bbox', () => {
    const KRAKOW = { x: 19.94498, y: 50.06465 };
    const NOWA_HUTA = { x: 20.03736, y: 50.07272 };
    const BRONOWICE = { x: 19.88157, y: 50.08194 };
    const WARSAW = { x: 21.01178, y: 52.22977 };

    const listRidesRaw = (query: Record<string, string>) =>
      appRef.app.inject({
        method: 'GET',
        url: '/rides',
        query,
        cookies: { accessToken: auth.accessToken },
      });

    it('returns rides inside the box and leaves out rides outside it', async () => {
      const nowaHutaId = await createRide({ start_location: NOWA_HUTA });
      const bronowiceId = await createRide({ start_location: BRONOWICE });
      await createRide({ start_location: WARSAW });

      const { data } = await listRides({
        bbox: formatBBox(bboxAround(KRAKOW, SEARCH_AREA_MAX_KM)),
      });

      expect(new Set(data.map((ride: { id: string }) => ride.id))).toEqual(
        new Set([nowaHutaId, bronowiceId]),
      );
    });

    it('accepts a box of exactly the maximum size at any latitude', async () => {
      for (const y of [0, 50.06465, 70]) {
        const response = await listRidesRaw({
          bbox: formatBBox(bboxAround({ x: 19.94498, y }, SEARCH_AREA_MAX_KM)),
        });

        expect(response.statusCode).toBe(200);
      }
    });

    it('rejects a box larger than the maximum size', async () => {
      const response = await listRidesRaw({
        bbox: formatBBox(bboxAround(KRAKOW, SEARCH_AREA_MAX_KM + 1)),
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().field).toBe('bbox');
    });

    it('rejects a box that crosses the antimeridian', async () => {
      const response = await listRidesRaw({ bbox: '179.8,-17,-179.8,-16.5' });

      expect(response.statusCode).toBe(400);
      expect(response.json().field).toBe('bbox');
    });

    it('rejects a box whose south is above its north', async () => {
      const response = await listRidesRaw({ bbox: '19.9,50.1,20,50' });

      expect(response.statusCode).toBe(400);
      expect(response.json().field).toBe('bbox');
    });

    it.each(['19.9,50,20', '19.9,50,20,50.1,1', 'a,b,c,d', '', '19.9,,20,50.1', '19.9,50,20,91'])(
      'rejects a malformed box %j',
      async (bbox) => {
        const response = await listRidesRaw({ bbox });

        expect(response.statusCode).toBe(400);
        expect(response.json().field).toBe('bbox');
      },
    );
  });

  describe('ids', () => {
    const listRidesRaw = (query: Record<string, string>) =>
      appRef.app.inject({
        method: 'GET',
        url: '/rides',
        query,
        cookies: { accessToken: auth.accessToken },
      });

    it('returns only the rides with the given ids', async () => {
      const firstId = await createRide();
      const secondId = await createRide();
      await createRide();

      const { data } = await listRides({ ids: `${firstId},${secondId}` });

      expect(new Set(data.map((ride: { id: string }) => ride.id))).toEqual(
        new Set([firstId, secondId]),
      );
    });

    it(`returns all ${RIDE_IDS_MAX} rides on one page without a limit`, async () => {
      const inserted = await createMultipleRandomRides(appRef.app.db, RIDE_IDS_MAX, auth.userId);

      const { data, nextCursor } = await listRides({
        ids: inserted.map((ride) => ride.id).join(','),
      });

      expect(data).toHaveLength(RIDE_IDS_MAX);
      expect(nextCursor).toBeNull();
    });

    it('never returns a private ride by id', async () => {
      const privateId = await createRide({ is_private: true });

      const { data } = await listRides({ ids: privateId });

      expect(data).toEqual([]);
    });

    it(`accepts ${RIDE_IDS_MAX} ids and rejects more`, async () => {
      const ids = Array.from({ length: RIDE_IDS_MAX + 1 }, () => randomUUID());

      const atCap = await listRidesRaw({ ids: ids.slice(0, RIDE_IDS_MAX).join(',') });
      const overCap = await listRidesRaw({ ids: ids.join(',') });

      expect(atCap.statusCode).toBe(200);
      expect(overCap.statusCode).toBe(400);
      expect(overCap.json().field).toBe('ids');
    });

    it.each(['', 'not-a-uuid', `${randomUUID()},`])('rejects malformed ids %j', async (ids) => {
      const response = await listRidesRaw({ ids });

      expect(response.statusCode).toBe(400);
      expect(response.json().field).toBe('ids');
    });
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

    const other = await registerUser(appRef.app, 'other@example.com', 'Password123!', 'otheruser');
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
      bbox: formatBBox(bboxAround({ x: 21.01178, y: 52.22977 }, 1)),
    });

    expect(unfiltered.data.map((ride: { id: string }) => ride.id)).toEqual([publicId]);
    expect(filtered.data.map((ride: { id: string }) => ride.id)).toEqual([publicId]);
  });

  it('returns published rides only', async () => {
    const [published] = await insertRides(
      { status: 'published' },
      { status: 'draft' },
      { status: 'cancelled' },
    );

    const { data } = await listRides();

    expect(data.map((ride: { id: string }) => ride.id)).toEqual([published]);
    expect(data[0].status).toBe('published');
  });

  it('ignores a status query parameter', async () => {
    const [published] = await insertRides(
      { status: 'published' },
      { status: 'draft' },
      { status: 'cancelled' },
    );

    expect(await listIds({ status: 'cancelled' })).toEqual([published]);
    expect(await listIds({ status: 'draft' })).toEqual([published]);
    expect(await listIds({ status: 'open' })).toEqual([published]);
  });

  describe('bike_type and ride_type', () => {
    it('bike_type=road leaves out a ride marked any', async () => {
      const [road] = await insertRides(
        { bike_type: 'road' },
        { bike_type: 'any' },
        { bike_type: 'gravel' },
      );

      expect(await listIds({ bike_type: 'road' })).toEqual([road]);
    });

    it('bike_type=any returns only rides marked any', async () => {
      const [any] = await insertRides(
        { bike_type: 'any' },
        { bike_type: 'road' },
        { bike_type: 'gravel' },
      );

      expect(await listIds({ bike_type: 'any' })).toEqual([any]);
    });

    it('ride_type returns only rides of that type', async () => {
      const [coffee] = await insertRides(
        { ride_type: 'coffee_ride' },
        { ride_type: 'training' },
        { ride_type: 'casual' },
      );

      expect(await listIds({ ride_type: 'coffee_ride' })).toEqual([coffee]);
    });

    it('combines both filters', async () => {
      const [gravelCoffee] = await insertRides(
        { bike_type: 'gravel', ride_type: 'coffee_ride' },
        { bike_type: 'gravel', ride_type: 'training' },
        { bike_type: 'road', ride_type: 'coffee_ride' },
        { bike_type: 'any', ride_type: 'coffee_ride' },
      );

      expect(await listIds({ bike_type: 'gravel', ride_type: 'coffee_ride' })).toEqual([
        gravelCoffee,
      ]);
    });
  });

  it('with the lower bound set to now, returns a ride inside the creation lead time and leaves out a started ride', async () => {
    const [startsSoon] = await appRef.app.db
      .insert(rides)
      .values([
        {
          ...newRide({ user_id: auth.userId }),
          start_time: new Date(Date.now() + 60 * 60 * 1000),
        },
        {
          ...newRide({ user_id: auth.userId }),
          start_time: new Date(Date.now() - 60 * 60 * 1000),
        },
      ])
      .returning({ id: rides.id });

    const { data } = await listRides({ date_from: new Date().toISOString() });

    expect(data.map((ride: { id: string }) => ride.id)).toEqual([startsSoon.id]);
  });

  describe('date_to', () => {
    const HOUR = 60 * 60 * 1000;

    it('keeps a ride that starts before it and leaves out one that starts after it', async () => {
      const now = Date.now();
      const [before] = await insertRides(
        { start_time: new Date(now + 2 * HOUR) },
        { start_time: new Date(now + 4 * HOUR) },
      );

      expect(
        await listIds({
          date_from: new Date(now).toISOString(),
          date_to: new Date(now + 3 * HOUR).toISOString(),
        }),
      ).toEqual([before]);
    });

    it('combines with bike_type and ride_type', async () => {
      const now = Date.now();
      const gravelCoffee = { bike_type: 'gravel', ride_type: 'coffee_ride' };
      const [match] = await insertRides(
        { ...gravelCoffee, start_time: new Date(now + 2 * HOUR) },
        { ...gravelCoffee, start_time: new Date(now + 4 * HOUR) },
        { ...gravelCoffee, start_time: new Date(now - HOUR) },
        { bike_type: 'road', ride_type: 'coffee_ride', start_time: new Date(now + 2 * HOUR) },
        { bike_type: 'gravel', ride_type: 'training', start_time: new Date(now + 2 * HOUR) },
      );

      expect(
        await listIds({
          ...gravelCoffee,
          date_from: new Date(now).toISOString(),
          date_to: new Date(now + 3 * HOUR).toISOString(),
        }),
      ).toEqual([match]);
    });
  });

  it('never repeats a ride across pages when start times carry microseconds', async () => {
    const inserted = await appRef.app.db
      .insert(rides)
      .values([
        {
          ...newRide({ user_id: auth.userId }),
          start_time: sql`date_trunc('second', now()) + interval '6 hours 0.123456 seconds'`,
        },
        {
          ...newRide({ user_id: auth.userId }),
          start_time: sql`date_trunc('second', now()) + interval '7 hours 0.654321 seconds'`,
        },
      ])
      .returning({ id: rides.id });

    const firstPage = await listRides({ limit: '1' });
    const secondPage = await listRides({ limit: '1', cursor: firstPage.nextCursor });
    const listedIds = [...firstPage.data, ...secondPage.data].map(
      (ride: { id: string }) => ride.id,
    );

    expect(listedIds).toHaveLength(2);
    expect(new Set(listedIds)).toEqual(new Set(inserted.map((ride) => ride.id)));
  });
});
