import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { useApp } from '../../helpers/app.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';
import { newRide } from '../../helpers/rides.js';
import { buildFileUpload } from '../../helpers/multipart.js';
import { routes } from '../../../src/db/schema.js';

vi.mock('../../../src/utils/s3.js');

const multisegmentFixture = readFileSync(
  new URL('../../fixtures/route-multisegment.gpx', import.meta.url),
);

describe('GET /rides/:id', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);

  const uploadRoute = async () => {
    const encoded = await buildFileUpload(multisegmentFixture, 'two-segments.gpx');

    const response = await appRef.app.inject({
      method: 'POST',
      url: '/routes',
      ...encoded,
      cookies: { accessToken: auth.accessToken },
    });

    return response.json().data.id as string;
  };

  const createAndGetRide = async (routeId?: string) => {
    const createResponse = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body: { ...newRide({ user_id: auth.userId }), route_id: routeId },
      cookies: { accessToken: auth.accessToken },
    });

    return appRef.app.inject({
      method: 'GET',
      url: `/rides/${createResponse.json().data.id}`,
      cookies: { accessToken: auth.accessToken },
    });
  };

  it('returns 404 when ride does not exist', async () => {
    const response = await appRef.app.inject({
      method: 'GET',
      url: '/rides/00000000-0000-0000-0000-000000000000',
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(404);
  });

  it('returns ride when found', async () => {
    const body = newRide({
      user_id: auth.userId,
      title: 'Morning Ride',
      city: 'Warsaw',
      country: 'PL',
    });

    const createResponse = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body,
      cookies: { accessToken: auth.accessToken },
    });

    const rideId = createResponse.json().data.id as string;

    const response = await appRef.app.inject({
      method: 'GET',
      url: `/rides/${rideId}`,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);

    const { data } = response.json();
    expect(data.id).toBe(rideId);
    expect(data.title).toBe('Morning Ride');
    expect(data.city).toBe('Warsaw');
    expect(data.country).toBe('PL');
    expect(data.creator.id).toBe(auth.userId);
    expect(data.creator.password_hash).toBeUndefined();
    expect(data.participants).toHaveLength(1);
    expect(data.participants[0].user_id).toBe(auth.userId);
  });

  it('describes the organiser by id and username only, with no email anywhere', async () => {
    const body = newRide({ user_id: auth.userId, city: 'Warsaw', country: 'PL' });

    const createResponse = await appRef.app.inject({
      method: 'POST',
      url: '/rides',
      body,
      cookies: { accessToken: auth.accessToken },
    });

    const response = await appRef.app.inject({
      method: 'GET',
      url: `/rides/${createResponse.json().data.id}`,
      cookies: { accessToken: auth.accessToken },
    });

    const { data } = response.json();

    expect(Object.keys(data.creator).sort()).toEqual(['id', 'username']);
    expect(Object.keys(data.participants[0].user).sort()).toEqual(['id', 'username']);
    expect(response.body).not.toContain(auth.email);
  });

  it('returns the route path as one [lon, lat] array per segment', async () => {
    const response = await createAndGetRide(await uploadRoute());

    expect(response.statusCode).toBe(200);

    const { path } = response.json().data.route;

    expect(path).toHaveLength(2);
    expect(path[0][0]).toEqual([21.01, 52.23]);
    expect(path[0].at(-1)).toEqual([21.01, 52.233]);
    expect(path[1][0]).toEqual([21.01, 52.25]);
    expect(path[1].at(-1)).toEqual([21.01, 52.252]);
  });

  it('exposes the path and the stored distance and ascent on the route', async () => {
    const response = await createAndGetRide(await uploadRoute());

    const { route } = response.json().data;

    expect(Object.keys(route).sort()).toEqual(['ascent_m', 'distance_km', 'path']);
    expect(Number(route.distance_km)).toBe(0.56);
    expect(Number(route.ascent_m)).toBe(22);
  });

  it('returns a null route when the ride has none', async () => {
    const response = await createAndGetRide();

    expect(response.statusCode).toBe(200);
    expect(response.json().data.route).toBeNull();
  });

  it('returns a null path for a route stored without one', async () => {
    const [stored] = await appRef.app.db
      .insert(routes)
      .values({
        user_id: auth.userId,
        name: 'Old Route',
        s3_key: `routes/${crypto.randomUUID()}.gpx`,
        distance_km: '12.50',
        ascent_m: '140.00',
      })
      .returning({ id: routes.id });

    const response = await createAndGetRide(stored.id);

    expect(response.statusCode).toBe(200);

    const { route } = response.json().data;

    expect(route.path).toBeNull();
    expect(Number(route.distance_km)).toBe(12.5);
    expect(Number(route.ascent_m)).toBe(140);
  });

  it('returns null distance and ascent for a route stored without them', async () => {
    const [stored] = await appRef.app.db
      .insert(routes)
      .values({
        user_id: auth.userId,
        name: 'Stats-less Route',
        s3_key: `routes/${crypto.randomUUID()}.gpx`,
      })
      .returning({ id: routes.id });

    const response = await createAndGetRide(stored.id);

    expect(response.statusCode).toBe(200);
    expect(response.json().data.route).toEqual({ path: null, distance_km: null, ascent_m: null });
  });
});
