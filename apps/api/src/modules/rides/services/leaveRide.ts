import { and, eq } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { ride_participants, rides } from '../../../db/schema.js';
import {
  CreatorCannotLeaveError,
  ParticipantNotFoundError,
  RideAlreadyStartedError,
  RideCancelledError,
  RideNotFoundError,
} from '../errors.js';

export const leaveRide = async (db: Db, userId: string, rideId: string) => {
  return await db.transaction(async (tx) => {
    const [existingRide] = await tx.select().from(rides).where(eq(rides.id, rideId)).for('update');

    if (!existingRide) {
      throw new RideNotFoundError();
    }

    if (existingRide.status === 'cancelled') {
      throw new RideCancelledError();
    }

    if (existingRide.start_time <= new Date()) {
      throw new RideAlreadyStartedError();
    }

    // the creator now holds a participant row, so without this they could delete
    // themselves out of their own ride
    if (existingRide.creator_id === userId) {
      throw new CreatorCannotLeaveError();
    }

    const [deleted] = await tx
      .delete(ride_participants)
      .where(and(eq(ride_participants.ride_id, rideId), eq(ride_participants.user_id, userId)))
      .returning();

    if (!deleted) {
      throw new ParticipantNotFoundError();
    }

    return deleted;
  });
};
