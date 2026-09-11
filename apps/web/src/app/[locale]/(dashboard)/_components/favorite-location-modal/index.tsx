import { protectedRequest } from '@/utils/api';
import type { GetCurrentUserResponse } from '@loopra/domain';
import { FavoriteLocationDialog } from './dialog';

export async function FavoriteLocationModal() {
  const response = await protectedRequest<GetCurrentUserResponse>('/users/me');

  if (!response.ok) {
    return null;
  }

  const { user } = response.data;

  if (user.location_prompt_dismissed_at || user.favorite_location) {
    return null;
  }

  return <FavoriteLocationDialog />;
}
