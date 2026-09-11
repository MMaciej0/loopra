import { and, eq } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { ride_participants, rides } from '../../../db/schema.js';
import { CreatorCannotLeaveError, ParticipantNotFoundError } from '../errors.js';

export const leaveRide = async (db: Db, userId: string, rideId: string) => {
  const [existingRide] = await db.select().from(rides).where(eq(rides.id, rideId)).limit(1);

  // the creator now holds a participant row, so without this they could delete
  // themselves out of their own ride
  if (existingRide && existingRide.creator_id === userId) {
    throw new CreatorCannotLeaveError();
  }

  const [deleted] = await db
    .delete(ride_participants)
    .where(and(eq(ride_participants.ride_id, rideId), eq(ride_participants.user_id, userId)))
    .returning();

  if (!deleted) {
    throw new ParticipantNotFoundError();
  }

  return deleted;
};
