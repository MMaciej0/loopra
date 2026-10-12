import { and, asc, desc, eq, gt, lte, ne, SQL } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { ride_participants, rides, routes, users } from '../../../db/schema.js';
import { ListMyRidesQuery } from '../schema.js';
import { rideListColumns } from './listRides.js';
import { afterRideCursor, toRidePage } from './rideCursor.js';

export const listMyRides = async (db: Db, userId: string, searchParams: ListMyRidesQuery) => {
  const { limit, role } = searchParams;
  const isPast = searchParams.phase === 'past';
  const now = new Date();
  const conditions: SQL[] = [
    ne(rides.status, 'draft'),
    isPast ? lte(rides.start_time, now) : gt(rides.start_time, now),
  ];
  const direction = isPast ? desc : asc;

  if (role === 'organising') conditions.push(eq(rides.creator_id, userId));
  if (role === 'joined') conditions.push(ne(rides.creator_id, userId));

  if (searchParams.cursor) {
    conditions.push(afterRideCursor(searchParams.cursor, isPast ? 'desc' : 'asc'));
  }

  const selectedRides = await db
    .select(rideListColumns)
    .from(rides)
    .innerJoin(
      ride_participants,
      and(eq(ride_participants.ride_id, rides.id), eq(ride_participants.user_id, userId)),
    )
    .innerJoin(users, eq(users.id, rides.creator_id))
    .leftJoin(routes, eq(routes.id, rides.route_id))
    .where(and(...conditions))
    .orderBy(direction(rides.start_time), direction(rides.id))
    .limit(limit + 1);

  return toRidePage(selectedRides, limit);
};
