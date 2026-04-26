import { and, eq, gte, lte, sql, SQL } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { events } from '../../../db/schema.js';
import { ListEventsQuery } from '../schema.js';

export const listEvents = async (db: Db, searchParams: ListEventsQuery) => {
  const conditions: SQL[] = [];

  if (searchParams.bike_type) conditions.push(eq(events.bike_type, searchParams.bike_type));
  if (searchParams.type) conditions.push(eq(events.type, searchParams.type));
  if (searchParams.difficulty) conditions.push(eq(events.difficulty, searchParams.difficulty));
  if (searchParams.city) conditions.push(eq(events.city, searchParams.city));
  if (searchParams.region) conditions.push(eq(events.region, searchParams.region));
  if (searchParams.country) conditions.push(eq(events.country, searchParams.country));
  if (searchParams.date_from) conditions.push(gte(events.start_time, searchParams.date_from));
  if (searchParams.date_to) conditions.push(lte(events.start_time, searchParams.date_to));
  if (searchParams.status) conditions.push(eq(events.status, searchParams.status));

  if (searchParams.lat && searchParams.lng && searchParams.radius_km) {
    conditions.push(
      sql`ST_DWithin(start_location::geography, ST_SetSRID(ST_MakePoint(${searchParams.lng}, ${searchParams.lat}), 4326)::geography, ${searchParams.radius_km} * 1000)`,
    );
  }

  if (searchParams.cursor) {
    const [cursorUUID, cursorStartTime] = searchParams.cursor.split(':');
    conditions.push(
      sql`(${events.start_time}, ${events.id}) > (${new Date(Number(cursorStartTime))}::timestamptz, ${cursorUUID}::uuid)`,
    );
  }

  const selectedEvents = await db
    .select()
    .from(events)
    .where(and(...conditions))
    .orderBy(events.start_time, events.id)
    .limit(searchParams.limit + 1);

  const data = selectedEvents.slice(0, searchParams.limit);
  let newCursor = null;

  if (selectedEvents.length > searchParams.limit) {
    newCursor = `${data[data.length - 1].id}:${data[data.length - 1].start_time.getTime()}`;
  }

  return {
    data,
    nextCursor: newCursor,
  };
};
