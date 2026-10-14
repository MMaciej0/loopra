'use server';

import { refresh } from 'next/cache';
import { FavoriteLocationResponseSchema } from '@loopra/domain/schemas';
import { protectedRequest } from '@/lib/api';

export async function deleteFavoriteLocation(id: string) {
  const response = await protectedRequest(`/users/me/favorite-locations/${id}`, {
    method: 'DELETE',
    schema: FavoriteLocationResponseSchema,
  });

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  refresh();
  return { ok: true as const };
}
