import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { ERROR_TYPES } from '@loopra/domain';
import { useApp } from '../../helpers/app.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';
import { newRide } from '../../helpers/rides.js';
import { ride_participants, rides, routes } from '../../../src/db/schema.js';
import { DOWNLOAD_URL_EXPIRES_IN_SECONDS } from '../../../src/utils/s3.js';
import { S3_BUCKET } from '../../../src/config/env.js';

describe('GET /rides/:id/route/download', () => {
  const appRef = useApp();
  const organiserAuth = useAuthenticatedUser(appRef);
  const strangerAuth = useAuthenticatedUser(appRef, 'stranger@example.com');

  const insertRoute = async (name = 'Warsaw loop', s3Key = 'routes/test/warsaw-loop.gpx') => {
    const [route] = await appRef.app.db
      .insert(routes)
      .values({ user_id: organiserAuth.userId, name, s3_key: s3Key })
      .returning();

    return route!;
  };

  const insertRide = async (routeId?: string) => {
    const [ride] = await appRef.app.db
      .insert(rides)
      .values({ ...newRide({ user_id: organiserAuth.userId }), route_id: routeId })
      .returning();
    await join(ride!.id, organiserAuth.userId);

    return ride!;
  };

  const join = async (rideId: string, userId = strangerAuth.userId) => {
    await appRef.app.db.insert(ride_participants).values({ ride_id: rideId, user_id: userId });
  };

  const download = (rideId: string, accessToken = strangerAuth.accessToken) =>
    appRef.app.inject({
      method: 'GET',
      url: `/rides/${rideId}/route/download`,
      cookies: { accessToken },
    });

  it('returns a signed url for the original upload', async () => {
    const route = await insertRoute();
    const ride = await insertRide(route.id);

    const response = await download(ride.id, organiserAuth.accessToken);

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(Object.keys(body)).toEqual(['data']);
    expect(Object.keys(body.data)).toEqual(['url']);

    const url = new URL(body.data.url);
    expect(`${url.host}${url.pathname}`).toContain(S3_BUCKET);
    expect(url.pathname).toContain(route.s3_key);
    expect(url.searchParams.get('X-Amz-Expires')).toBe(String(DOWNLOAD_URL_EXPIRES_IN_SECONDS));
    expect(url.searchParams.get('response-content-disposition')).toBe(
      `attachment; filename="Warsaw loop.gpx"; filename*=UTF-8''Warsaw%20loop.gpx`,
    );
    expect(url.searchParams.get('response-content-type')).toBe('application/gpx+xml');
  });

  it('returns 200 for a participant who is not the organiser', async () => {
    const route = await insertRoute();
    const ride = await insertRide(route.id);
    await join(ride.id);

    const response = await download(ride.id);

    expect(response.statusCode).toBe(200);
  });

  it('returns 404 PARTICIPANT_NOT_FOUND for a rider who has not joined', async () => {
    const route = await insertRoute();
    const ride = await insertRide(route.id);

    const response = await download(ride.id);

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ type: ERROR_TYPES.PARTICIPANT_NOT_FOUND });
  });

  it('returns 404 PARTICIPANT_NOT_FOUND for a ride without a route when not joined', async () => {
    const ride = await insertRide();

    const response = await download(ride.id);

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ type: ERROR_TYPES.PARTICIPANT_NOT_FOUND });
  });

  it('returns 200 for a cancelled ride with a route', async () => {
    const route = await insertRoute();
    const ride = await insertRide(route.id);
    await join(ride.id);
    await appRef.app.db.update(rides).set({ status: 'cancelled' }).where(eq(rides.id, ride.id));

    const response = await download(ride.id);

    expect(response.statusCode).toBe(200);
  });

  it('returns 404 ROUTE_NOT_FOUND for a ride without a route', async () => {
    const ride = await insertRide();
    await join(ride.id);

    const response = await download(ride.id);

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ type: ERROR_TYPES.ROUTE_NOT_FOUND });
  });

  it('returns 404 RIDE_NOT_FOUND for an unknown ride', async () => {
    const response = await download('00000000-0000-0000-0000-000000000000');

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ type: ERROR_TYPES.RIDE_NOT_FOUND });
  });

  it('returns 404 RIDE_NOT_FOUND for a malformed id', async () => {
    const response = await download('abc');

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ type: ERROR_TYPES.RIDE_NOT_FOUND });
  });

  it('returns 401 without login', async () => {
    const route = await insertRoute();
    const ride = await insertRide(route.id);

    const response = await appRef.app.inject({
      method: 'GET',
      url: `/rides/${ride.id}/route/download`,
    });

    expect(response.statusCode).toBe(401);
  });

  it('keeps a non-ASCII name in filename* and strips unsafe characters from the fallback', async () => {
    const name = 'Pętla "przez" Łódź';
    const route = await insertRoute(name);
    const ride = await insertRide(route.id);
    await join(ride.id);

    const response = await download(ride.id);

    const disposition = new URL(response.json().data.url).searchParams.get(
      'response-content-disposition',
    )!;
    const fallback = disposition.match(/filename="([^"]*)"/)![1]!;
    const encoded = disposition.match(/filename\*=UTF-8''(.+)$/)![1]!;

    expect(fallback).toMatch(/^[\x20-\x7e]+\.gpx$/);
    expect(fallback).not.toMatch(/["\\]/);
    expect(decodeURIComponent(encoded)).toBe(`${name}.gpx`);
  });
});
