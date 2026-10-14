'use server';

import { refresh } from 'next/cache';
import { UpdateSelectedLocationResponseSchema } from '@loopra/domain/schemas';
import { protectedRequest } from '@/lib/api';
import type { LocationSuggestion } from '@/features/locations/geocoding';
import { toLocationBody } from '@/features/locations/to-location-body';

export async function saveSelectedLocation(location: LocationSuggestion) {
  const response = await protectedRequest('/users/me/selected-location', {
    method: 'PUT',
    body: JSON.stringify(toLocationBody(location)),
    schema: UpdateSelectedLocationResponseSchema,
  });

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  refresh();
  return { ok: true as const };
}
