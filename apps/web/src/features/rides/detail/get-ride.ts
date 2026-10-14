import { cache } from 'react';
import { ERROR_TYPES } from '@loopra/domain';
import { RideDetailResponseSchema } from '@loopra/domain/schemas';
import { protectedRequest } from '@/lib/api';

export const getRide = cache(async (id: string) => {
  const response = await protectedRequest(`/rides/${encodeURIComponent(id)}`, {
    schema: RideDetailResponseSchema,
  });

  if (response.ok) {
    return response.data.data;
  }

  if (response.errorType === ERROR_TYPES.RIDE_NOT_FOUND) {
    return null;
  }

  throw new Error(`Failed to load ride: ${response.errorType}`);
});
