import { asc, eq } from 'drizzle-orm';
import type { Db, Tx } from '../../../db/index.js';
import { favorite_locations } from '../../../db/schema.js';

export const listFavoriteLocations = async (db: Db | Tx, userId: string) =>
  db
    .select()
    .from(favorite_locations)
    .where(eq(favorite_locations.user_id, userId))
    .orderBy(asc(favorite_locations.created_at));
