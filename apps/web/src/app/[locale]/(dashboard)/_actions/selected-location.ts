'use server';

import { refresh } from 'next/cache';
import { DEFAULT_SELECTED_LOCATION } from '@loopra/domain';
import { protectedRequest } from '@/utils/api';
import type { LocationSuggestion } from '@/utils/geocoding';

async function replaceSelectedLocation(payload: object) {
  const response = await protectedRequest('/users/me/selected-location', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  refresh();
  return { ok: true as const };
}

export async function acceptDefaultSelectedLocation() {
  return replaceSelectedLocation(DEFAULT_SELECTED_LOCATION);
}

export async function saveSelectedLocation(location: LocationSuggestion) {
  return replaceSelectedLocation({
    location: location.coords,
    city: location.city,
    district: location.district || null,
    municipality: location.municipality || null,
    region: location.region || null,
    country: location.country,
    postal_code: location.postal_code || null,
  });
}
