import { FavoriteLocationPill } from '@/features/locations/components/favorite-location-pill/favorite-location-pill';
import { RidesFilters } from './rides-filters';
import { RidesViewToggle } from './rides-view-toggle';
import type { RidesFilters as RidesFiltersValue } from '@/features/rides/browse/filters';
import type { RidesView } from '@/features/rides/browse/view';

type Props = Readonly<{ view: RidesView; filters: RidesFiltersValue }>;

export function RidesBar({ view, filters }: Props) {
  return (
    <div className="border-border grid shrink-0 grid-cols-[1fr_auto] items-center gap-3 border-b py-3 md:grid-cols-[auto_1fr_auto] md:gap-4">
      <div className="col-span-2 col-start-1 row-start-1 min-w-0 md:col-span-1">
        <FavoriteLocationPill />
      </div>

      <div className="col-start-1 row-start-2 min-w-0 md:col-start-2 md:row-start-1">
        <RidesFilters view={view} filters={filters} />
      </div>

      <div className="col-start-2 row-start-2 justify-self-end md:col-start-3 md:row-start-1">
        <RidesViewToggle view={view} filters={filters} />
      </div>
    </div>
  );
}
