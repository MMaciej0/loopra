import { cache } from 'react';
import type { GetCurrentUserResponse } from '@loopra/domain';
import { protectedRequest } from '@/lib/api';

export const getCurrentUser = cache(async () => {
  const response = await protectedRequest<GetCurrentUserResponse>('/users/me');

  return response.ok ? response.data.user : null;
});
