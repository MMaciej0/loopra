import { eq } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { ride_participants, rides } from '../../../db/schema.js';
import {
  RideNotFoundError,
  RideAlreadyStartedError,
  MaxParticipantsError,
  ParticipantExistsError,
} from '../errors.js';

export const joinRide = async (db: Db, userId: string, rideId: string) => {
  return await db.transaction(async (tx) => {
    await tx.select({ id: rides.id }).from(rides).where(eq(rides.id, rideId)).for('update');

    const existingRide = await tx.query.rides.findFirst({
      where: eq(rides.id, rideId),
      with: {
        participants: true,
      },
    });

    if (!existingRide) {
      throw new RideNotFoundError();
    }

    if (existingRide.start_time <= new Date()) {
      throw new RideAlreadyStartedError();
    }

    // the creator has a participant row of their own, so this covers them too
    if (existingRide.participants.some((participant) => participant.user_id === userId)) {
      throw new ParticipantExistsError();
    }

    if (existingRide.participants.length >= existingRide.max_participants) {
      throw new MaxParticipantsError();
    }

    const [newParticipant] = await tx
      .insert(ride_participants)
      .values({ ride_id: rideId, user_id: userId })
      .returning();

    return newParticipant;
  });
};
