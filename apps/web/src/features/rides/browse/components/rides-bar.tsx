import { FavoriteLocationPill } from '@/features/locations/components/favorite-location-pill/favorite-location-pill';
import { RidesFilterControls } from './rides-filter-controls';
import { RidesViewToggle } from './rides-view-toggle';
import type { RidesFilters } from '@/features/rides/browse/filters';
import type { RidesView } from '@/features/rides/browse/view';

type Props = Readonly<{ view: RidesView; filters: RidesFilters }>;

export function RidesBar({ view, filters }: Props) {
  return (
    <div className="border-border @container shrink-0 border-b py-3">
      <div className="grid grid-cols-[auto_1fr] items-center gap-3 @3xl:grid-cols-[auto_1fr_auto] @3xl:gap-4">
        <RidesFilterControls view={view} filters={filters}>
          <div className="min-w-0">
            <FavoriteLocationPill />
          </div>

          <div className="col-span-2 justify-self-end @3xl:col-span-1">
            <RidesViewToggle view={view} filters={filters} />
          </div>
        </RidesFilterControls>
      </div>
    </div>
  );
}
