import { and, count, eq, ne } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { ride_participants, rides } from '../../../db/schema.js';
import { RideNotFoundError, RideHasParticipantsError } from '../errors.js';

export const deleteRide = async (db: Db, id: string, creatorId: string) => {
  const [existingRide] = await db.select().from(rides).where(eq(rides.id, id)).limit(1);

  if (!existingRide || existingRide.creator_id !== creatorId) {
    throw new RideNotFoundError();
  }

  // the creator always holds a row of their own — only other riders block deletion
  const [{ count: participantCount }] = await db
    .select({ count: count() })
    .from(ride_participants)
    .where(and(eq(ride_participants.ride_id, id), ne(ride_participants.user_id, creatorId)));

  if (Number(participantCount) > 0) {
    throw new RideHasParticipantsError();
  }

  const [deletedRide] = await db.delete(rides).where(eq(rides.id, id)).returning();

  return deletedRide;
};
