import { formatLocationLabel } from '@/utils/geocoding';
import { getCurrentUser } from '@/utils/user';
import { buildRidesListQuery, ridesListKey } from '../../list-query';
import { RidesMap } from './map';

export async function RidesMapPane() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const locationLabel = formatLocationLabel({
    district: user.favorite_district ?? '',
    city: user.favorite_city,
    country: user.favorite_country,
  });

  const query = buildRidesListQuery(user.favorite_location);

  return <RidesMap key={ridesListKey(query)} query={query} locationLabel={locationLabel} />;
}
