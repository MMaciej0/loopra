import { cache } from 'react';
import { GetCurrentUserResponseSchema } from '@loopra/domain/schemas';
import { protectedRequest } from '@/lib/api';

export const getCurrentUser = cache(async () => {
  const response = await protectedRequest('/users/me', {
    schema: GetCurrentUserResponseSchema,
  });

  return response.ok ? response.data.user : null;
});
