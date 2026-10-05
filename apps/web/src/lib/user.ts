import { cache } from 'react';
import type { GetCurrentUserResponse, ListFavoriteLocationsResponse } from '@loopra/domain';
import { protectedRequest } from '@/lib/api';
import { toLocationSuggestion, type LocationSuggestion } from '@/features/locations/geocoding';

export const getCurrentUser = cache(async () => {
  const response = await protectedRequest<GetCurrentUserResponse>('/users/me');

  return response.ok ? response.data.user : null;
});

export const getFavoriteLocations = cache(async (): Promise<LocationSuggestion[]> => {
  const response = await protectedRequest<ListFavoriteLocationsResponse>(
    '/users/me/favorite-locations',
  );

  if (!response.ok) {
    return [];
  }

  return response.data.favorite_locations.map((favorite) =>
    toLocationSuggestion(favorite, favorite.id),
  );
});
