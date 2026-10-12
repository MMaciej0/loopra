import { bboxAround, SEARCH_AREA_MAX_KM } from '@loopra/domain';
import { formatLocationLabel } from '@/features/locations/geocoding';
import { getCurrentUser } from '@/lib/user';
import { buildRidesListQuery, ridesListKey, ridesMapKey } from '@/features/rides/browse/list-query';
import { RidesMap } from '@/features/rides/browse/components/rides-map/rides-map';
import { RidesList } from './rides-list';
import type { RidesFilters } from '@/features/rides/browse/filters';
import type { RidesView } from '@/features/rides/browse/view';

type Props = Readonly<{ view: RidesView; filters: RidesFilters }>;

export async function ViewPane({ view, filters }: Props) {
  const user = await getCurrentUser();

  if (!user?.selected_location) {
    return null;
  }

  const center = user.selected_location.location;
  const searchArea = bboxAround(center, SEARCH_AREA_MAX_KM);
  const query = buildRidesListQuery(searchArea, filters);

  if (view === 'map') {
    const { district, city, country } = user.selected_location;
    const screenReaderLocationLabel = formatLocationLabel({
      district: district ?? '',
      city,
      country,
    });

    return (
      <RidesMap
        key={ridesMapKey(query)}
        query={query}
        center={center}
        screenReaderLocationLabel={screenReaderLocationLabel}
      />
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <RidesList key={ridesListKey(query)} query={query} />
    </div>
  );
}
