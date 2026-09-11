import { eq } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { rides } from '../../../db/schema.js';
import { UpdateRideBody } from '../schema.js';
import { RideNotFoundError, RideUpdateBadBodyError } from '../errors.js';

export const updateRide = async (
  db: Db,
  rideId: string,
  creatorId: string,
  updatedBody: UpdateRideBody,
) => {
  const [existingRide] = await db.select().from(rides).where(eq(rides.id, rideId)).limit(1);

  if (!existingRide) {
    throw new RideNotFoundError();
  }

  if (existingRide.creator_id !== creatorId) {
    throw new RideNotFoundError();
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

  const [updatedRide] = await db
    .update(rides)
    .set(updatedBody)
    .where(eq(rides.id, rideId))
    .returning();

  return updatedRide;
};
