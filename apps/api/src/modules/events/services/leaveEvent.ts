import { and, eq } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { event_participants, events } from '../../../db/schema.js';
import { CreatorCannotLeaveError, ParticipantNotFoundError } from '../errors.js';

export const leaveEvent = async (db: Db, userId: string, eventId: string) => {
  const [existingEvent] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);

  // the creator now holds a participant row, so without this they could delete
  // themselves out of their own ride
  if (existingEvent && existingEvent.creator_id === userId) {
    throw new CreatorCannotLeaveError();
  }

  const [deleted] = await db
    .delete(event_participants)
    .where(and(eq(event_participants.event_id, eventId), eq(event_participants.user_id, userId)))
    .returning();

  if (!deleted) {
    throw new ParticipantNotFoundError();
  }

  return deleted;
};
