import { getCurrentUser } from '@/lib/user';
import { getFavoriteLocations } from '@/features/locations/favorites';
import { FirstRunLocationDialog } from './dialog';

export async function FirstRunLocationPrompt() {
  const user = await getCurrentUser();

  if (!user || user.selected_location) {
    return null;
  }

  const favorites = await getFavoriteLocations();

  return <FirstRunLocationDialog favorites={favorites} />;
}
