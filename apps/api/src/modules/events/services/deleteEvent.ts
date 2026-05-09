import { count, eq } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { event_participants, events } from '../../../db/schema.js';
import { EventNotFoundError, EventHasParticipantsError } from '../errors.js';

export const deleteEvent = async (db: Db, id: string, creatorId: string) => {
  const [existingEvent] = await db.select().from(events).where(eq(events.id, id)).limit(1);

  if (!existingEvent || existingEvent.creator_id !== creatorId) {
    throw new EventNotFoundError();
  }

  const [{ count: participantCount }] = await db
    .select({ count: count() })
    .from(event_participants)
    .where(eq(event_participants.event_id, id));

  if (Number(participantCount) > 0) {
    throw new EventHasParticipantsError();
  }

  const [deletedEvent] = await db.delete(events).where(eq(events.id, id)).returning();

  return deletedEvent;
};
