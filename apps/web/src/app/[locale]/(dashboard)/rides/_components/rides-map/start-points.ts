import type { RideListItem } from '@loopra/domain';

export type StartPointGroup = Readonly<{
  lng: number;
  lat: number;
  name: string | null;
  rideCount: number;
}>;

export function groupByStartPoint(rides: readonly RideListItem[]): StartPointGroup[] {
  const groups = new Map<string, StartPointGroup>();

  for (const ride of rides) {
    if (!ride.start_location) continue;

    const { x: lng, y: lat } = ride.start_location;
    const key = `${lng},${lat}`;
    const group = groups.get(key);

    groups.set(
      key,
      group
        ? { ...group, name: group.name ?? ride.start_location_name, rideCount: group.rideCount + 1 }
        : { lng, lat, name: ride.start_location_name, rideCount: 1 },
    );
  }

  return [...groups.values()];
}
