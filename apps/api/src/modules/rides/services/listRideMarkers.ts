import { and, sql } from 'drizzle-orm';
import { RIDE_MARKERS_MAX } from '@loopra/domain';
import { Db } from '../../../db/index.js';
import { rides } from '../../../db/schema.js';
import { ListRideMarkersQuery } from '../schema.js';
import { rideFilterConditions } from './rideFilterConditions.js';

export const listRideMarkers = async (db: Db, searchParams: ListRideMarkersQuery) => {
  const markers = await db
    .select({
      id: rides.id,
      lng: sql<number>`ST_X(${rides.start_location})`.mapWith(Number),
      lat: sql<number>`ST_Y(${rides.start_location})`.mapWith(Number),
    })
    .from(rides)
    .where(and(...rideFilterConditions(searchParams)))
    .orderBy(rides.start_time, rides.id)
    .limit(RIDE_MARKERS_MAX + 1);

  return {
    data: markers.slice(0, RIDE_MARKERS_MAX),
    truncated: markers.length > RIDE_MARKERS_MAX,
  };
};
