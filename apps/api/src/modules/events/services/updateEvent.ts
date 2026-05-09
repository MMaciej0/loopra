import { eq } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { events } from '../../../db/schema.js';
import { UpdateEventBody } from '../schema.js';

export class EventNotFoundError extends Error {}
export class EventUpdateBadBodyError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'EventUpdateBadBodyError';
  }
}

export const updateEvent = async (
  db: Db,
  eventId: string,
  creatorId: string,
  updatedBody: UpdateEventBody,
) => {
  const [existingEvent] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);

  if (!existingEvent) {
    throw new EventNotFoundError();
  }

  if (existingEvent.creator_id !== creatorId) {
    throw new EventNotFoundError();
  }

  if (
    updatedBody.end_time &&
    !updatedBody.start_time &&
    updatedBody.end_time < existingEvent.start_time
  ) {
    throw new EventUpdateBadBodyError('End time cannot be before start time');
  }

  if (
    updatedBody.start_time &&
    !updatedBody.end_time &&
    existingEvent.end_time &&
    updatedBody.start_time >= existingEvent.end_time
  ) {
    throw new EventUpdateBadBodyError('Start time cannot be after end time');
  }

  const [updatedEvent] = await db
    .update(events)
    .set(updatedBody)
    .where(eq(events.id, eventId))
    .returning();

  return updatedEvent;
};
