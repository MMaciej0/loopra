import { eq } from 'drizzle-orm';
import { ridePhase } from '@loopra/domain';
import { Db } from '../../../db/index.js';
import { rides } from '../../../db/schema.js';
import { RideAlreadyStartedError, RideCancelledError, RideNotFoundError } from '../errors.js';

export const cancelRide = async (db: Db, rideId: string, organiserId: string) => {
  return await db.transaction(async (tx) => {
    const [existingRide] = await tx.select().from(rides).where(eq(rides.id, rideId)).for('update');

    if (!existingRide || existingRide.creator_id !== organiserId) {
      throw new RideNotFoundError();
    }

    if (existingRide.status === 'cancelled') {
      throw new RideCancelledError();
    }

    if (ridePhase(existingRide.start_time, new Date()) === 'past') {
      throw new RideAlreadyStartedError();
    }

    const [cancelledRide] = await tx
      .update(rides)
      .set({ status: 'cancelled' })
      .where(eq(rides.id, rideId))
      .returning();

    return cancelledRide;
  });
};
