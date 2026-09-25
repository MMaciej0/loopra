import { and, eq, getTableColumns, inArray, sql } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { ride_participants, rides, routes, users } from '../../../db/schema.js';
import { ListRidesQuery } from '../schema.js';
import { rideFilterConditions } from './rideFilterConditions.js';

export const listRides = async (db: Db, searchParams: ListRidesQuery) => {
  const conditions = rideFilterConditions(searchParams);
  const limit = searchParams.ids?.length ?? searchParams.limit;

  if (searchParams.ids) conditions.push(inArray(rides.id, searchParams.ids));

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
    .limit(limit + 1);

  const data = selectedRides.slice(0, limit);
  let newCursor = null;

  if (selectedRides.length > limit) {
    newCursor = `${data[data.length - 1].id}:${data[data.length - 1].start_time.getTime()}`;
  }

  return {
    data,
    nextCursor: newCursor,
  };
};
