import { protectedRequest } from '@/utils/api';
import type { GetCurrentUserResponse } from '@loopra/domain';
import { FirstRunLocationDialog } from './dialog';

export async function FirstRunLocationPrompt() {
  const response = await protectedRequest<GetCurrentUserResponse>('/users/me');

  if (!response.ok) {
    return null;
  }

  const { user } = response.data;

  if (user.favorite_location_chosen) {
    return null;
  }

  return <FirstRunLocationDialog />;
}
