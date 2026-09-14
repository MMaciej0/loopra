'use server';

import { refresh } from 'next/cache';
import { protectedRequest } from '@/utils/api';
import type { LocationSuggestion } from '@/utils/geocoding';

export async function acceptDefaultFavoriteLocation() {
  const response = await protectedRequest('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ favorite_location_chosen: true }),
  });

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  refresh();
  return { ok: true as const };
}

export async function saveFavoriteLocation(location: LocationSuggestion) {
  const payload = {
    favorite_location: location.coords,
    favorite_city: location.city || location.municipality,
    favorite_country: location.country,
    favorite_municipality: location.municipality || null,
    favorite_region: location.region || null,
    favorite_postal_code: location.postal_code || null,
  };

  const response = await protectedRequest('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  refresh();
  return { ok: true as const };
}
