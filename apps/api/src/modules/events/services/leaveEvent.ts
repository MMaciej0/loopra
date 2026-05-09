import { and, eq } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { event_participants } from '../../../db/schema.js';
import { ParticipantNotFoundError } from '../errors.js';

export const leaveEvent = async (db: Db, userId: string, eventId: string) => {
  const [deleted] = await db
    .delete(event_participants)
    .where(and(eq(event_participants.event_id, eventId), eq(event_participants.user_id, userId)))
    .returning();

  if (!deleted) {
    throw new ParticipantNotFoundError();
  }

  return deleted;
};
