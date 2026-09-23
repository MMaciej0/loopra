import { formatLocationLabel, MAX_FAVORITE_LOCATIONS } from '@loopra/domain';
import type { Db } from '../../../db/index.js';
import { favorite_locations } from '../../../db/schema.js';
import { LocationBody } from '../schema.js';
import { DuplicateFavoriteLocationError, MaxFavoriteLocationsError } from '../errors.js';
import { listFavoriteLocations } from './listFavoriteLocations.js';

export const createFavoriteLocation = async (db: Db, userId: string, body: LocationBody) => {
  const existing = await listFavoriteLocations(db, userId);
  const label = formatLocationLabel(body);

  if (existing.some((favorite) => formatLocationLabel(favorite) === label)) {
    throw new DuplicateFavoriteLocationError();
  }

  if (existing.length >= MAX_FAVORITE_LOCATIONS) {
    throw new MaxFavoriteLocationsError();
  }

  const [favoriteLocation] = await db
    .insert(favorite_locations)
    .values({ user_id: userId, ...body })
    .returning();

  return favoriteLocation;
};
