import { eq, getTableColumns } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { ride_participants, rides, routes, users } from '../../../db/schema.js';
import { RideNotFoundError } from '../errors.js';

export const getRide = async (db: Db, id: string) => {
  const [ride] = await db
    .select({
      ...getTableColumns(rides),
      creator: { id: users.id, username: users.username },
      route: {
        id: routes.id,
        path: routes.path,
        elevation_profile: routes.elevation_profile,
        max_elevation_m: routes.max_elevation_m,
        min_elevation_m: routes.min_elevation_m,
        distance_km: routes.distance_km,
        ascent_m: routes.ascent_m,
      },
    })
    .from(rides)
    .innerJoin(users, eq(users.id, rides.creator_id))
    .leftJoin(routes, eq(routes.id, rides.route_id))
    .where(eq(rides.id, id));

  if (!ride) {
    throw new RideNotFoundError();
  }

  const participants = await db
    .select({
      ...getTableColumns(ride_participants),
      user: { id: users.id, username: users.username },
    })
    .from(ride_participants)
    .innerJoin(users, eq(users.id, ride_participants.user_id))
    .where(eq(ride_participants.ride_id, id));

  return { ...ride, participants };
};
