import { getCurrentUser, getFavoriteLocations } from '@/lib/user';
import { FirstRunLocationDialog } from './dialog';

export async function FirstRunLocationPrompt() {
  const user = await getCurrentUser();

  if (!user || user.selected_location) {
    return null;
  }

  const favorites = await getFavoriteLocations();

  return <FirstRunLocationDialog favorites={favorites} />;
}
