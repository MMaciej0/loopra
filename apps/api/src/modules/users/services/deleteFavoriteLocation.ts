import { and, eq } from 'drizzle-orm';
import type { Db } from '../../../db/index.js';
import { favorite_locations } from '../../../db/schema.js';
import { FavoriteLocationNotFoundError } from '../errors.js';

export const deleteFavoriteLocation = async (db: Db, userId: string, id: string) => {
  const [deleted] = await db
    .delete(favorite_locations)
    .where(and(eq(favorite_locations.id, id), eq(favorite_locations.user_id, userId)))
    .returning();

  if (!deleted) {
    throw new FavoriteLocationNotFoundError();
  }

  return deleted;
};
