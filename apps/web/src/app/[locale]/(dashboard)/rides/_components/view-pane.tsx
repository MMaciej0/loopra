import { formatLocationLabel } from '@/utils/geocoding';
import { getCurrentUser } from '@/utils/user';
import { buildRidesListQuery, ridesListKey } from '../list-query';
import { RidesMap } from './rides-map';
import { RidesList } from './rides-list';
import type { RidesView } from '../view';

export async function ViewPane({ view }: { view: RidesView }) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const query = buildRidesListQuery(user.favorite_location);
  const key = ridesListKey(query);

  if (view === 'map') {
    const screenReaderLocationLabel = formatLocationLabel({
      district: user.favorite_district ?? '',
      city: user.favorite_city,
      country: user.favorite_country,
    });

    return (
      <RidesMap key={key} query={query} screenReaderLocationLabel={screenReaderLocationLabel} />
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <RidesList key={key} query={query} />
    </div>
  );
}
