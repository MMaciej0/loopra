import { getCurrentUser } from '@/utils/user';
import { buildRidesListQuery, ridesListKey } from '../list-query';
import { RidesMapPane } from './rides-map';
import { RidesList } from './rides-list';
import type { RidesView } from '../view';

export async function ViewPane({ view }: { view: RidesView }) {
  if (view === 'map') {
    return <RidesMapPane />;
  }

  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const query = buildRidesListQuery(user.favorite_location);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <RidesList key={ridesListKey(query)} query={query} />
    </div>
  );
}
