import { eq } from 'drizzle-orm';
import { isSamePlace, MAX_FAVORITE_LOCATIONS } from '@loopra/domain';
import type { Db } from '../../../db/index.js';
import { favorite_locations, users } from '../../../db/schema.js';
import { LocationBody } from '../schema.js';
import { DuplicateFavoriteLocationError, MaxFavoriteLocationsError } from '../errors.js';
import { listFavoriteLocations } from './listFavoriteLocations.js';

export const createFavoriteLocation = async (db: Db, userId: string, body: LocationBody) => {
  return await db.transaction(async (tx) => {
    await tx.select({ id: users.id }).from(users).where(eq(users.id, userId)).for('update');

    const existing = await listFavoriteLocations(tx, userId);

    if (existing.some((favorite) => isSamePlace(favorite.location, body.location))) {
      throw new DuplicateFavoriteLocationError();
    }

    if (existing.length >= MAX_FAVORITE_LOCATIONS) {
      throw new MaxFavoriteLocationsError();
    }

    const [favoriteLocation] = await tx
      .insert(favorite_locations)
      .values({ user_id: userId, ...body })
      .returning();

    return favoriteLocation;
  });
};
