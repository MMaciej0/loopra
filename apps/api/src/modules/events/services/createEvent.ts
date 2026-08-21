import { and, eq } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { event_participants, events, routes } from '../../../db/schema.js';
import { CreateEventBody } from '../schema.js';
import { RouteNotFoundError } from '../errors.js';

export const createEvent = async (db: Db, creatorId: string, event: CreateEventBody) => {
  const eventWithCreatorId = { ...event, creator_id: creatorId };

  return await db.transaction(async (tx) => {
    if (event.route_id !== undefined) {
      const [route] = await tx
        .select({ id: routes.id })
        .from(routes)
        .where(and(eq(routes.id, event.route_id), eq(routes.user_id, creatorId)));

      if (!route) {
        throw new RouteNotFoundError();
      }
    }

    const created = await tx.insert(events).values(eventWithCreatorId).returning();

    // the creator rides too — they hold a seat and belong in the participant list
    await tx
      .insert(event_participants)
      .values({ event_id: created[0].id, user_id: creatorId });

    return created;
  });
};
