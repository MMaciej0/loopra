import { eq } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { ride_participants, rides } from '../../../db/schema.js';
import { RideNotFoundError, MaxParticipantsError, ParticipantExistsError } from '../errors.js';

export const joinRide = async (db: Db, userId: string, rideId: string) => {
  const existingRide = await db.query.rides.findFirst({
    where: eq(rides.id, rideId),
    with: {
      participants: true,
    },
  });

  if (!existingRide) {
    throw new RideNotFoundError();
  }

  // the creator has a participant row of their own, so this covers them too
  if (existingRide.participants.some((participant) => participant.user_id === userId)) {
    throw new ParticipantExistsError();
  }

  if (
    existingRide.max_participants &&
    existingRide.participants.length >= existingRide.max_participants
  ) {
    throw new MaxParticipantsError();
  }

  const [newParticipant] = await db
    .insert(ride_participants)
    .values({ ride_id: rideId, user_id: userId })
    .returning();

  return newParticipant;
};
