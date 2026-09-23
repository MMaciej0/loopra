import { asc, eq } from 'drizzle-orm';
import type { Db } from '../../../db/index.js';
import { favorite_locations } from '../../../db/schema.js';

export const listFavoriteLocations = async (db: Db, userId: string) =>
  db
    .select()
    .from(favorite_locations)
    .where(eq(favorite_locations.user_id, userId))
    .orderBy(asc(favorite_locations.created_at));
