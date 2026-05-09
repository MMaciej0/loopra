import { eq } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { events } from '../../../db/schema.js';
import { EventNotFoundError } from '../errors.js';

export const getEvent = async (db: Db, id: string) => {
  const event = await db.query.events.findFirst({
    where: eq(events.id, id),
    with: {
      creator: {
        columns: {
          id: true,
          email: true,
          created_at: true,
          updated_at: true,
        },
      },
      participants: {
        with: {
          user: {
            columns: {
              id: true,
              email: true,
              created_at: true,
              updated_at: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    throw new EventNotFoundError();
  }

  return event;
};
