import { eq, gte, lte, sql, SQL } from 'drizzle-orm';
import { rides } from '../../../db/schema.js';
import { ListRidesQuery } from '../schema.js';

type RideFilters = Omit<ListRidesQuery, 'cursor' | 'limit' | 'ids'>;

export const rideFilterConditions = (filters: RideFilters) => {
  const conditions: SQL[] = [eq(rides.is_private, false)];

  if (filters.bike_type) conditions.push(eq(rides.bike_type, filters.bike_type));
  if (filters.ride_type) conditions.push(eq(rides.ride_type, filters.ride_type));
  if (filters.city) conditions.push(eq(rides.city, filters.city));
  if (filters.region) conditions.push(eq(rides.region, filters.region));
  if (filters.country) conditions.push(eq(rides.country, filters.country));
  if (filters.date_from) conditions.push(gte(rides.start_time, filters.date_from));
  if (filters.date_to) conditions.push(lte(rides.start_time, filters.date_to));
  if (filters.status) conditions.push(eq(rides.status, filters.status));

  if (filters.bbox) {
    const { west, south, east, north } = filters.bbox;
    conditions.push(
      sql`${rides.start_location} && ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326)`,
    );
  }

  return conditions;
};
