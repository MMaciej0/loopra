import type { SelectedLocation } from '@loopra/domain';
import { formatLocationLabel, type LocationSuggestion } from '@/utils/geocoding';
import { getCurrentUser } from '@/utils/user';
import { FavoriteLocationPillDialog } from './dialog';

const STORED_LOCATION_ID = 'loopra:stored-selected-location';

function toStoredLocation(selectedLocation: SelectedLocation): LocationSuggestion {
  const parts = {
    city: selectedLocation.city,
    district: selectedLocation.district ?? '',
    country: selectedLocation.country,
  };

  return {
    id: STORED_LOCATION_ID,
    label: formatLocationLabel(parts),
    coords: selectedLocation.location,
    ...parts,
    region: selectedLocation.region ?? '',
    municipality: selectedLocation.municipality ?? '',
    postal_code: selectedLocation.postal_code ?? '',
    full_address: '',
  };
}

export async function FavoriteLocationPill() {
  const user = await getCurrentUser();

  if (!user?.selected_location) {
    return null;
  }

  return <FavoriteLocationPillDialog storedLocation={toStoredLocation(user.selected_location)} />;
}
