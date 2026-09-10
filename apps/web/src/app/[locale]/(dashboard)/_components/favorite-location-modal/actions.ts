'use server';

import { refresh } from 'next/cache';
import { protectedRequest } from '@/utils/api';
import type { LocationSuggestion } from '@/utils/geocoding';

export async function dismissFavoriteLocationPrompt() {
  const response = await protectedRequest('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ dismiss_location_prompt: true }),
  });

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  refresh();
  return { ok: true as const };
}

export async function saveFavoriteLocation(location: LocationSuggestion) {
  const payload: Record<string, unknown> = { favorite_location: location.coords };

  const fields = {
    favorite_city: location.city,
    favorite_municipality: location.municipality,
    favorite_region: location.region,
    favorite_country: location.country,
    favorite_postal_code: location.postal_code,
  };

  for (const [key, value] of Object.entries(fields)) {
    if (value) payload[key] = value;
  }

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
