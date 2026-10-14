'use server';

import { refresh } from 'next/cache';
import { FavoriteLocationResponseSchema } from '@loopra/domain/schemas';
import { protectedRequest } from '@/lib/api';
import type { LocationSuggestion } from '@/features/locations/geocoding';
import { toLocationBody } from '@/features/locations/to-location-body';

export async function saveFavoriteLocation(location: LocationSuggestion) {
  const response = await protectedRequest('/users/me/favorite-locations', {
    method: 'POST',
    body: JSON.stringify(toLocationBody(location)),
    schema: FavoriteLocationResponseSchema,
  });

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  refresh();
  return { ok: true as const };
}
