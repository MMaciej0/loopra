import { FavoriteLocationPill } from './favorite-location-pill';
import { RidesSearchField } from './rides-search-field';
import { RidesViewToggle } from './rides-view-toggle';
import type { RidesView } from '../view';

export function RidesBar({ view }: { view: RidesView }) {
  return (
    <div className="border-border grid shrink-0 grid-cols-[1fr_auto] items-center gap-3 border-b py-3 md:grid-cols-[auto_1fr_auto] md:gap-4">
      <div className="col-span-2 col-start-1 row-start-1 min-w-0 md:col-span-1">
        <FavoriteLocationPill />
      </div>

      <div className="col-start-1 row-start-2 min-w-0 md:col-start-2 md:row-start-1">
        <RidesSearchField />
      </div>

      <div className="col-start-2 row-start-2 justify-self-end md:col-start-3 md:row-start-1">
        <RidesViewToggle view={view} />
      </div>
    </div>
  );
}
