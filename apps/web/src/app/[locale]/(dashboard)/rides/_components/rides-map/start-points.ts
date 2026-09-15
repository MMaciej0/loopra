import type { RideListItem } from '@loopra/domain';
import type { RideCardData } from '@/components/ride-card/types';
import { toRideCard } from '../rides-list/to-ride-card';

export type StartPointRide = Readonly<{ id: string; data: RideCardData }>;

export type StartPointGroup = Readonly<{
  id: string;
  lng: number;
  lat: number;
  name: string | null;
  rides: readonly StartPointRide[];
}>;

export function groupByStartPoint(rides: readonly RideListItem[]): StartPointGroup[] {
  const groups = new Map<
    string,
    { lng: number; lat: number; name: string | null; rides: StartPointRide[] }
  >();

  const byStartTime = rides.toSorted((a, b) => Date.parse(a.start_time) - Date.parse(b.start_time));

  for (const ride of byStartTime) {
    if (!ride.start_location) continue;

    const { x: lng, y: lat } = ride.start_location;
    const id = `${lng},${lat}`;
    const group = groups.get(id) ?? { lng, lat, name: null, rides: [] };

    group.name ??= ride.start_location_name;
    group.rides.push({ id: ride.id, data: toRideCard(ride) });
    groups.set(id, group);
  }

  return [...groups].map(([id, group]) => ({ id, ...group }));
}
