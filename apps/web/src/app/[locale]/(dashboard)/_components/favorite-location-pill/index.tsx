import type { CurrentUser } from '@loopra/domain';
import { formatLocationLabel, type LocationSuggestion } from '@/utils/geocoding';
import { getCurrentUser } from '@/utils/user';
import { FavoriteLocationPillDialog } from './dialog';

const STORED_LOCATION_ID = 'loopra:stored-favorite-location';

function toStoredLocation(user: CurrentUser): LocationSuggestion {
  const parts = {
    city: user.favorite_city,
    district: user.favorite_district ?? '',
    country: user.favorite_country,
  };

  return {
    id: STORED_LOCATION_ID,
    label: formatLocationLabel(parts),
    coords: user.favorite_location,
    ...parts,
    region: user.favorite_region ?? '',
    municipality: user.favorite_municipality ?? '',
    postal_code: user.favorite_postal_code ?? '',
    full_address: '',
  };
}

export async function FavoriteLocationPill() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return <FavoriteLocationPillDialog storedLocation={toStoredLocation(user)} />;
}
