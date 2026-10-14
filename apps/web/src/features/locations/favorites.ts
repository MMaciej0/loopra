import { cache } from 'react';
import { ListFavoriteLocationsResponseSchema } from '@loopra/domain/schemas';
import { protectedRequest } from '@/lib/api';
import { toLocationSuggestion, type LocationSuggestion } from '@/features/locations/geocoding';

export const getFavoriteLocations = cache(async (): Promise<LocationSuggestion[]> => {
  const response = await protectedRequest('/users/me/favorite-locations', {
    schema: ListFavoriteLocationsResponseSchema,
  });

  if (!response.ok) {
    return [];
  }

  return response.data.favorite_locations.map((favorite) =>
    toLocationSuggestion(favorite, favorite.id),
  );
});
