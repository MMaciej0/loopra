import { toLocationSuggestion } from '@/utils/geocoding';
import { getCurrentUser, getFavoriteLocations } from '@/utils/user';
import { FavoriteLocationPillDialog } from './dialog';

const STORED_LOCATION_ID = 'loopra:stored-selected-location';

export async function FavoriteLocationPill() {
  const user = await getCurrentUser();

  if (!user?.selected_location) {
    return null;
  }

  const favorites = await getFavoriteLocations();

  return (
    <FavoriteLocationPillDialog
      storedLocation={toLocationSuggestion(user.selected_location, STORED_LOCATION_ID)}
      favorites={favorites}
    />
  );
}
