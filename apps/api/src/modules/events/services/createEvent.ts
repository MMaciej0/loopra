import { Db } from '../../../db/index.js';
import { event_participants, events } from '../../../db/schema.js';
import { CreateEventBody } from '../schema.js';

export const createEvent = async (db: Db, creatorId: string, event: CreateEventBody) => {
  const eventWithCreatorId = { ...event, creator_id: creatorId };

  return await db.transaction(async (tx) => {
    const created = await tx.insert(events).values(eventWithCreatorId).returning();

    // the creator rides too — they hold a seat and belong in the participant list
    await tx
      .insert(event_participants)
      .values({ event_id: created[0].id, user_id: creatorId });

    return created;
  });
};
