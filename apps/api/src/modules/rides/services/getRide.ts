import { eq } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { rides } from '../../../db/schema.js';
import { RideNotFoundError } from '../errors.js';

export const getRide = async (db: Db, id: string) => {
  const ride = await db.query.rides.findFirst({
    where: eq(rides.id, id),
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

  if (!ride) {
    throw new RideNotFoundError();
  }

  return ride;
};
