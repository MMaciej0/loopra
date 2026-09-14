import type { CurrentUser } from '@loopra/domain';
import type { LocationSuggestion } from '@/utils/geocoding';
import { getCurrentUser } from '@/utils/user';
import { FavoriteLocationPillDialog } from './dialog';

const STORED_LOCATION_ID = 'loopra:stored-favorite-location';

function toStoredLocation(user: CurrentUser): LocationSuggestion {
  return {
    id: STORED_LOCATION_ID,
    label: `${user.favorite_city}, ${user.favorite_country}`,
    coords: user.favorite_location,
    city: user.favorite_city,
    country: user.favorite_country,
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
