import { getCurrentUser } from '@/utils/user';
import { FirstRunLocationDialog } from './dialog';

export async function FirstRunLocationPrompt() {
  const user = await getCurrentUser();

  if (!user || user.favorite_location_chosen) {
    return null;
  }

  return <FirstRunLocationDialog />;
}
