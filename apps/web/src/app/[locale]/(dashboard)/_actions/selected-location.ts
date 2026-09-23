'use server';

import { refresh } from 'next/cache';
import { DEFAULT_SELECTED_LOCATION } from '@loopra/domain';
import { protectedRequest } from '@/utils/api';
import type { LocationSuggestion } from '@/utils/geocoding';

function toLocationBody(location: LocationSuggestion) {
  return {
    location: location.coords,
    city: location.city,
    district: location.district || null,
    municipality: location.municipality || null,
    region: location.region || null,
    country: location.country,
    postal_code: location.postal_code || null,
  };
}

async function putSelectedLocation(payload: object) {
  return protectedRequest('/users/me/selected-location', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function acceptDefaultSelectedLocation() {
  const response = await putSelectedLocation(DEFAULT_SELECTED_LOCATION);

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  refresh();
  return { ok: true as const };
}

export async function saveFavoriteLocation(location: LocationSuggestion) {
  const response = await protectedRequest('/users/me/favorite-locations', {
    method: 'POST',
    body: JSON.stringify(toLocationBody(location)),
  });

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  refresh();
  return { ok: true as const };
}

export async function saveSelectedLocation(location: LocationSuggestion) {
  const response = await putSelectedLocation(toLocationBody(location));

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  refresh();
  return { ok: true as const };
}

export async function deleteFavoriteLocation(id: string) {
  const response = await protectedRequest(`/users/me/favorite-locations/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  refresh();
  return { ok: true as const };
}
