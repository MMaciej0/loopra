import { cache } from 'react';
import { ERROR_TYPES, type RideDetailResponse } from '@loopra/domain';
import { protectedRequest } from '@/lib/api';

export const getRide = cache(async (id: string) => {
  const response = await protectedRequest<RideDetailResponse>(`/rides/${encodeURIComponent(id)}`);

  if (response.ok) {
    return response.data.data;
  }

  if (response.errorType === ERROR_TYPES.RIDE_NOT_FOUND) {
    return null;
  }

  throw new Error(`Failed to load ride: ${response.errorType}`);
});
