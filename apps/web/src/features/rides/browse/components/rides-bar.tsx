import { FavoriteLocationPill } from '@/features/locations/components/favorite-location-pill/favorite-location-pill';
import { RidesFilterControls } from './rides-filter-controls';
import { RidesViewToggle } from './rides-view-toggle';
import type { RidesFilters } from '@/features/rides/browse/filters';
import type { RidesView } from '@/features/rides/browse/view';

type Props = Readonly<{ view: RidesView; filters: RidesFilters }>;

export function RidesBar({ view, filters }: Props) {
  return (
    <div className="border-border @container shrink-0 border-b py-3">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 @3xl:gap-4 @7xl:grid-cols-[auto_1fr_auto]">
        <div className="col-span-2 col-start-1 row-start-1 min-w-0 @3xl:col-span-1">
          <FavoriteLocationPill />
        </div>

        <RidesFilterControls view={view} filters={filters} />

        <div className="col-start-2 row-start-2 justify-self-end @3xl:row-start-1 @7xl:col-start-3">
          <RidesViewToggle view={view} filters={filters} />
        </div>
      </div>
    </div>
  );
}
