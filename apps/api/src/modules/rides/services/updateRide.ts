import { eq } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { rides } from '../../../db/schema.js';
import { UpdateRideBody } from '../schema.js';
import { RideCancelledError, RideNotFoundError, RideUpdateBadBodyError } from '../errors.js';

export const updateRide = async (
  db: Db,
  rideId: string,
  creatorId: string,
  updatedBody: UpdateRideBody,
) => {
  return await db.transaction(async (tx) => {
    const [existingRide] = await tx.select().from(rides).where(eq(rides.id, rideId)).for('update');

    if (!existingRide) {
      throw new RideNotFoundError();
    }

    if (existingRide.creator_id !== creatorId) {
      throw new RideNotFoundError();
    }

    if (existingRide.status === 'cancelled') {
      throw new RideCancelledError();
    }

    if (
      updatedBody.end_time &&
      !updatedBody.start_time &&
      updatedBody.end_time < existingRide.start_time
    ) {
      throw new RideUpdateBadBodyError('End time cannot be before start time');
    }

    if (
      updatedBody.start_time &&
      !updatedBody.end_time &&
      existingRide.end_time &&
      updatedBody.start_time >= existingRide.end_time
    ) {
      throw new RideUpdateBadBodyError('Start time cannot be after end time');
    }

    const [updatedRide] = await tx
      .update(rides)
      .set(updatedBody)
      .where(eq(rides.id, rideId))
      .returning();

    return updatedRide;
  });
};
