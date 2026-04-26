import { Db } from '../../../db/index.js';
import { events } from '../../../db/schema.js';
import { CreateEventBody } from '../schema.js';

export const createEvent = async (db: Db, creatorId: string, event: CreateEventBody) => {
  const eventWithCreatorId = { ...event, creator_id: creatorId };

  return await db.insert(events).values(eventWithCreatorId).returning();
};
