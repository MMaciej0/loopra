import { bboxAround, SEARCH_AREA_MAX_KM } from '@loopra/domain';
import { formatLocationLabel } from '@/features/locations/geocoding';
import { getCurrentUser } from '@/lib/user';
import { buildRidesListQuery, ridesListKey } from '@/features/rides/list/list-query';
import { RidesMap } from '@/features/rides/map/rides-map';
import { RidesList } from './rides-list/rides-list';
import type { RidesView } from '@/features/rides/list/view';

export async function ViewPane({ view }: { view: RidesView }) {
  const user = await getCurrentUser();

  if (!user?.selected_location) {
    return null;
  }

  const center = user.selected_location.location;
  const searchArea = bboxAround(center, SEARCH_AREA_MAX_KM);
  const query = buildRidesListQuery(searchArea);
  const key = ridesListKey(query);

  if (view === 'map') {
    const { district, city, country } = user.selected_location;
    const screenReaderLocationLabel = formatLocationLabel({
      district: district ?? '',
      city,
      country,
    });

    return (
      <RidesMap
        key={key}
        query={query}
        center={center}
        screenReaderLocationLabel={screenReaderLocationLabel}
      />
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <RidesList key={key} query={query} />
    </div>
  );
}
