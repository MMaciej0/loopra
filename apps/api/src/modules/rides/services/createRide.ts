import { and, eq } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { ride_participants, rides, routes } from '../../../db/schema.js';
import { CreateRideBody } from '../schema.js';
import { RouteNotFoundError } from '../errors.js';

export const createRide = async (db: Db, creatorId: string, ride: CreateRideBody) => {
  const rideWithCreatorId = { ...ride, creator_id: creatorId };

  return await db.transaction(async (tx) => {
    if (ride.route_id !== undefined) {
      const [route] = await tx
        .select({ id: routes.id })
        .from(routes)
        .where(and(eq(routes.id, ride.route_id), eq(routes.user_id, creatorId)));

      if (!route) {
        throw new RouteNotFoundError();
      }
    }

    const [created] = await tx.insert(rides).values(rideWithCreatorId).returning();

    // the creator rides too — they hold a seat and belong in the participant list
    await tx.insert(ride_participants).values({ ride_id: created.id, user_id: creatorId });

    return created;
  });
};
