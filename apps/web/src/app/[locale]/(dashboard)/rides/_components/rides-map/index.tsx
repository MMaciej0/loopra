import { formatLocationLabel } from '@/utils/geocoding';
import { getCurrentUser } from '@/utils/user';
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

  return (
    <RidesMap
      lng={user.favorite_location.x}
      lat={user.favorite_location.y}
      locationLabel={locationLabel}
    />
  );
}
