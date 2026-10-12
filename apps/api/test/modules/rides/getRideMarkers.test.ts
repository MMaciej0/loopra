import { describe, expect, it } from 'vitest';
import { bboxAround, formatBBox, RIDE_MARKERS_MAX, SEARCH_AREA_MAX_KM } from '@loopra/domain';
import { useApp } from '../../helpers/app.js';
import { newRide } from '../../helpers/rides.js';
import { rides } from '../../../src/db/schema.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';

describe('GET /rides/markers', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);

  const KRAKOW = { x: 19.94498, y: 50.06465 };
  const NOWA_HUTA = { x: 20.03736, y: 50.07272 };
  const WARSAW = { x: 21.01178, y: 52.22977 };
  const krakowBBox = formatBBox(bboxAround(KRAKOW, SEARCH_AREA_MAX_KM));

  const insertRides = async (count: number, overrides: Record<string, unknown> = {}) => {
    const values = Array.from({ length: count }, () => ({
      ...newRide({ user_id: auth.userId }),
      start_location: NOWA_HUTA,
      ...overrides,
    }));

    return appRef.app.db.insert(rides).values(values).returning({ id: rides.id });
  };

  const listMarkersRaw = (query: Record<string, string>) =>
    appRef.app.inject({
      method: 'GET',
      url: '/rides/markers',
      query,
      cookies: { accessToken: auth.accessToken },
    });

  const listMarkers = async (query: Record<string, string>) => {
    const response = await listMarkersRaw(query);

    expect(response.statusCode).toBe(200);

    return response.json();
  };

  it('returns markers with exactly the whitelisted keys', async () => {
    const [{ id }] = await insertRides(1);

    const body = await listMarkers({ bbox: krakowBBox });

    expect(Object.keys(body).sort()).toEqual(['data', 'truncated']);
    expect(Object.keys(body.data[0]).sort()).toEqual(['id', 'lat', 'lng']);
    expect(body.data[0]).toEqual({ id, lng: NOWA_HUTA.x, lat: NOWA_HUTA.y });
    expect(body.truncated).toBe(false);
  });

  it('returns only rides inside the box', async () => {
    const [inside] = await insertRides(1);
    await insertRides(1, { start_location: WARSAW });

    const { data } = await listMarkers({ bbox: krakowBBox });

    expect(data.map((marker: { id: string }) => marker.id)).toEqual([inside.id]);
  });

  it('returns published rides only', async () => {
    const [published] = await insertRides(1, { status: 'published' });
    await insertRides(1, { status: 'draft' });
    await insertRides(1, { status: 'cancelled' });

    const { data } = await listMarkers({ bbox: krakowBBox });

    expect(data.map((marker: { id: string }) => marker.id)).toEqual([published.id]);
  });

  it('ignores a status query parameter', async () => {
    const [published] = await insertRides(1, { status: 'published' });
    await insertRides(1, { status: 'draft' });
    await insertRides(1, { status: 'cancelled' });

    for (const status of ['cancelled', 'draft', 'open']) {
      const { data } = await listMarkers({ bbox: krakowBBox, status });

      expect(data.map((marker: { id: string }) => marker.id)).toEqual([published.id]);
    }
  });

  it('applies the same filters as the list', async () => {
    const urbanCasual = { bike_type: 'urban', ride_type: 'casual' };
    const [published] = await insertRides(1, urbanCasual);
    await insertRides(1, { ...urbanCasual, status: 'cancelled' });
    await insertRides(1, { ...urbanCasual, is_private: true });
    await insertRides(1, { ...urbanCasual, start_time: new Date(Date.now() + 60 * 60 * 1000) });

    const { data } = await listMarkers({
      bbox: krakowBBox,
      date_from: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    });

    expect(data.map((marker: { id: string }) => marker.id)).toEqual([published.id]);

    const [road] = await insertRides(1, { bike_type: 'road', ride_type: 'training' });
    const [any] = await insertRides(1, { bike_type: 'any', ride_type: 'training' });
    const [gravelCoffee] = await insertRides(1, { bike_type: 'gravel', ride_type: 'coffee_ride' });
    const [gravelSightseeing] = await insertRides(1, {
      bike_type: 'gravel',
      ride_type: 'sightseeing',
    });
    await insertRides(1, { bike_type: 'mtb', ride_type: 'coffee_ride' });

    const markerIds = async (filters: Record<string, string>) => {
      const body = await listMarkers({ bbox: krakowBBox, ...filters });

      return body.data.map((marker: { id: string }) => marker.id);
    };

    expect(await markerIds({ bike_type: 'road' })).toEqual([road.id]);
    expect(await markerIds({ bike_type: 'any' })).toEqual([any.id]);
    expect(await markerIds({ ride_type: 'sightseeing' })).toEqual([gravelSightseeing.id]);
    expect(await markerIds({ bike_type: 'gravel', ride_type: 'coffee_ride' })).toEqual([
      gravelCoffee.id,
    ]);
  });

  it('with the lower bound set to now, returns a ride inside the creation lead time and leaves out a started ride', async () => {
    const [startsSoon] = await insertRides(1, {
      start_time: new Date(Date.now() + 60 * 60 * 1000),
    });
    await insertRides(1, { start_time: new Date(Date.now() - 60 * 60 * 1000) });

    const { data } = await listMarkers({
      bbox: krakowBBox,
      date_from: new Date().toISOString(),
    });

    expect(data.map((marker: { id: string }) => marker.id)).toEqual([startsSoon.id]);
  });

  it('gives the same result as the list for the same time window', async () => {
    const HOUR = 60 * 60 * 1000;
    const now = Date.now();
    const gravelCoffee = { bike_type: 'gravel', ride_type: 'coffee_ride' };
    const [inside] = await insertRides(1, { start_time: new Date(now + 2 * HOUR) });
    const [insideGravelCoffee] = await insertRides(1, {
      ...gravelCoffee,
      start_time: new Date(now + 2.5 * HOUR),
    });
    await insertRides(1, { start_time: new Date(now + 4 * HOUR) });
    await insertRides(1, { ...gravelCoffee, start_time: new Date(now + 4 * HOUR) });
    await insertRides(1, { start_time: new Date(now - HOUR) });

    const timeWindow = {
      bbox: krakowBBox,
      date_from: new Date(now).toISOString(),
      date_to: new Date(now + 3 * HOUR).toISOString(),
    };

    const idsFrom = async (url: string, query: Record<string, string>) => {
      const response = await appRef.app.inject({
        method: 'GET',
        url,
        query,
        cookies: { accessToken: auth.accessToken },
      });

      expect(response.statusCode).toBe(200);

      return response.json().data.map((ride: { id: string }) => ride.id);
    };

    expect(await idsFrom('/rides/markers', timeWindow)).toEqual([inside.id, insideGravelCoffee.id]);
    expect(await idsFrom('/rides', timeWindow)).toEqual([inside.id, insideGravelCoffee.id]);

    const filtered = { ...timeWindow, ...gravelCoffee };

    expect(await idsFrom('/rides/markers', filtered)).toEqual([insideGravelCoffee.id]);
    expect(await idsFrom('/rides', filtered)).toEqual([insideGravelCoffee.id]);
  });

  it('orders markers by start time', async () => {
    const [later] = await insertRides(1, { start_time: new Date(Date.now() + 9 * 3600_000) });
    const [sooner] = await insertRides(1, { start_time: new Date(Date.now() + 7 * 3600_000) });

    const { data } = await listMarkers({ bbox: krakowBBox });

    expect(data.map((marker: { id: string }) => marker.id)).toEqual([sooner.id, later.id]);
  });

  it('requires a bbox', async () => {
    const response = await listMarkersRaw({});

    expect(response.statusCode).toBe(400);
    expect(response.json().field).toBe('bbox');
  });

  it('rejects a box larger than the maximum size', async () => {
    const response = await listMarkersRaw({
      bbox: formatBBox(bboxAround(KRAKOW, SEARCH_AREA_MAX_KM + 1)),
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().field).toBe('bbox');
  });

  it('is not truncated at exactly the cap', async () => {
    await insertRides(RIDE_MARKERS_MAX);

    const { data, truncated } = await listMarkers({ bbox: krakowBBox });

    expect(data).toHaveLength(RIDE_MARKERS_MAX);
    expect(truncated).toBe(false);
  });

  it('caps the markers and flags truncation over the cap', async () => {
    await insertRides(RIDE_MARKERS_MAX + 1);

    const { data, truncated } = await listMarkers({ bbox: krakowBBox });

    expect(data).toHaveLength(RIDE_MARKERS_MAX);
    expect(truncated).toBe(true);
  });
});
