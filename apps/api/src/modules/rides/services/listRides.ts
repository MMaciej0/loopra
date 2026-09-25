import { and, eq, getTableColumns, gte, lte, sql, SQL } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { ride_participants, rides, routes, users } from '../../../db/schema.js';
import { ListRidesQuery } from '../schema.js';

export const listRides = async (db: Db, searchParams: ListRidesQuery) => {
  const conditions: SQL[] = [eq(rides.is_private, false)];

  if (searchParams.bike_type) conditions.push(eq(rides.bike_type, searchParams.bike_type));
  if (searchParams.ride_type) conditions.push(eq(rides.ride_type, searchParams.ride_type));
  if (searchParams.city) conditions.push(eq(rides.city, searchParams.city));
  if (searchParams.region) conditions.push(eq(rides.region, searchParams.region));
  if (searchParams.country) conditions.push(eq(rides.country, searchParams.country));
  if (searchParams.date_from) conditions.push(gte(rides.start_time, searchParams.date_from));
  if (searchParams.date_to) conditions.push(lte(rides.start_time, searchParams.date_to));
  if (searchParams.status) conditions.push(eq(rides.status, searchParams.status));

  if (searchParams.bbox) {
    const { west, south, east, north } = searchParams.bbox;
    conditions.push(
      sql`${rides.start_location} && ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326)`,
    );
  }

  if (searchParams.cursor) {
    const [cursorUUID, cursorStartTime] = searchParams.cursor.split(':');
    conditions.push(
      sql`(${rides.start_time}, ${rides.id}) > (${new Date(Number(cursorStartTime))}::timestamptz, ${cursorUUID}::uuid)`,
    );
  }

  const selectedRides = await db
    .select({
      ...getTableColumns(rides),
      creator: { id: users.id, username: users.username },
      participant_count:
        sql<number>`(select count(*) from ${ride_participants} where ${ride_participants.ride_id} = ${rides.id})`.mapWith(
          Number,
        ),
      route: { distance_km: routes.distance_km, ascent_m: routes.ascent_m },
    })
    .from(rides)
    .innerJoin(users, eq(users.id, rides.creator_id))
    .leftJoin(routes, eq(routes.id, rides.route_id))
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
