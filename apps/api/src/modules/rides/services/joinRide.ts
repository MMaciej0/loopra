import { eq } from 'drizzle-orm';
import { ridePhase } from '@loopra/domain';
import { Db } from '../../../db/index.js';
import { ride_participants, rides } from '../../../db/schema.js';
import {
  RideNotFoundError,
  RideAlreadyStartedError,
  RideCancelledError,
  MaxParticipantsError,
  ParticipantExistsError,
} from '../errors.js';

export const joinRide = async (db: Db, userId: string, rideId: string) => {
  return await db.transaction(async (tx) => {
    const [existingRide] = await tx
      .select({
        status: rides.status,
        start_time: rides.start_time,
        max_participants: rides.max_participants,
      })
      .from(rides)
      .where(eq(rides.id, rideId))
      .for('update');

    if (!existingRide) {
      throw new RideNotFoundError();
    }

    if (existingRide.status === 'cancelled') {
      throw new RideCancelledError();
    }

    if (ridePhase(existingRide.start_time, new Date()) === 'past') {
      throw new RideAlreadyStartedError();
    }

    const participants = await tx
      .select({ user_id: ride_participants.user_id })
      .from(ride_participants)
      .where(eq(ride_participants.ride_id, rideId));

    // the creator has a participant row of their own, so this covers them too
    if (participants.some((participant) => participant.user_id === userId)) {
      throw new ParticipantExistsError();
    }

    if (participants.length >= existingRide.max_participants) {
      throw new MaxParticipantsError();
    }

    const [newParticipant] = await tx
      .insert(ride_participants)
      .values({ ride_id: rideId, user_id: userId })
      .returning();

    return newParticipant;
  });
};
