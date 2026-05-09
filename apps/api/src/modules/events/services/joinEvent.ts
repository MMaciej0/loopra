import { eq } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { event_participants, events } from '../../../db/schema.js';
import { EventNotFoundError, MaxParticipantsError, ParticipantExistsError } from '../errors.js';

export const joinEvent = async (db: Db, userId: string, eventId: string) => {
  const existingEvent = await db.query.events.findFirst({
    where: eq(events.id, eventId),
    with: {
      participants: true,
    },
  });

  if (!existingEvent) {
    throw new EventNotFoundError();
  }

  if (
    existingEvent.participants.some((participant) => participant.user_id === userId) ||
    existingEvent.creator_id === userId
  ) {
    throw new ParticipantExistsError();
  }

  if (
    existingEvent.max_participants &&
    existingEvent.participants.length >= existingEvent.max_participants
  ) {
    throw new MaxParticipantsError();
  }

  const [newParticipant] = await db
    .insert(event_participants)
    .values({ event_id: eventId, user_id: userId })
    .returning();

  return newParticipant;
};
