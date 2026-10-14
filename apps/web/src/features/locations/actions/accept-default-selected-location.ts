'use server';

import { refresh } from 'next/cache';
import { DEFAULT_SELECTED_LOCATION } from '@loopra/domain';
import { UpdateSelectedLocationResponseSchema } from '@loopra/domain/schemas';
import { protectedRequest } from '@/lib/api';

export async function acceptDefaultSelectedLocation() {
  const response = await protectedRequest('/users/me/selected-location', {
    method: 'PUT',
    body: JSON.stringify(DEFAULT_SELECTED_LOCATION),
    schema: UpdateSelectedLocationResponseSchema,
  });

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  refresh();
  return { ok: true as const };
}
