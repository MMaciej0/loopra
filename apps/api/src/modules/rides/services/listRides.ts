import { and, eq, gte, lte, sql, SQL } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { rides } from '../../../db/schema.js';
import { ListRidesQuery } from '../schema.js';

export const listRides = async (db: Db, searchParams: ListRidesQuery) => {
  const conditions: SQL[] = [];

  if (searchParams.bike_type) conditions.push(eq(rides.bike_type, searchParams.bike_type));
  if (searchParams.ride_type) conditions.push(eq(rides.ride_type, searchParams.ride_type));
  if (searchParams.city) conditions.push(eq(rides.city, searchParams.city));
  if (searchParams.region) conditions.push(eq(rides.region, searchParams.region));
  if (searchParams.country) conditions.push(eq(rides.country, searchParams.country));
  if (searchParams.date_from) conditions.push(gte(rides.start_time, searchParams.date_from));
  if (searchParams.date_to) conditions.push(lte(rides.start_time, searchParams.date_to));
  if (searchParams.status) conditions.push(eq(rides.status, searchParams.status));

  if (searchParams.lat && searchParams.lng && searchParams.radius_km) {
    conditions.push(
      sql`ST_DWithin(start_location::geography, ST_SetSRID(ST_MakePoint(${searchParams.lng}, ${searchParams.lat}), 4326)::geography, ${searchParams.radius_km} * 1000)`,
    );
  }

  if (searchParams.cursor) {
    const [cursorUUID, cursorStartTime] = searchParams.cursor.split(':');
    conditions.push(
      sql`(${rides.start_time}, ${rides.id}) > (${new Date(Number(cursorStartTime))}::timestamptz, ${cursorUUID}::uuid)`,
    );
  }

  const selectedRides = await db
    .select()
    .from(rides)
    .where(and(...conditions))
    .orderBy(rides.start_time, rides.id)
    .limit(searchParams.limit + 1);

  const data = selectedRides.slice(0, searchParams.limit);
  let newCursor = null;

  if (selectedRides.length > searchParams.limit) {
    newCursor = `${data[data.length - 1].id}:${data[data.length - 1].start_time.getTime()}`;
  }

  return {
    data,
    nextCursor: newCursor,
  };
};
