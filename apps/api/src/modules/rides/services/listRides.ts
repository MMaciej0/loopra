import { and, eq, getTableColumns, inArray } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { rides, routes, users } from '../../../db/schema.js';
import { ListRidesQuery } from '../schema.js';
import { participantCount, rideFilterConditions } from './rideFilterConditions.js';
import { afterRideCursor, toRidePage } from './rideCursor.js';

export const rideListColumns = {
  ...getTableColumns(rides),
  creator: { id: users.id, username: users.username },
  participant_count: participantCount.mapWith(Number),
  route: { distance_km: routes.distance_km, ascent_m: routes.ascent_m },
};

export const listRides = async (db: Db, searchParams: ListRidesQuery) => {
  const conditions = rideFilterConditions(searchParams);
  const limit = searchParams.ids?.length ?? searchParams.limit;

  if (searchParams.ids) conditions.push(inArray(rides.id, searchParams.ids));

  if (searchParams.cursor) conditions.push(afterRideCursor(searchParams.cursor));

  const selectedRides = await db
    .select(rideListColumns)
    .from(rides)
    .innerJoin(users, eq(users.id, rides.creator_id))
    .leftJoin(routes, eq(routes.id, rides.route_id))
    .where(and(...conditions))
    .orderBy(rides.start_time, rides.id)
    .limit(limit + 1);

  return toRidePage(selectedRides, limit);
};
