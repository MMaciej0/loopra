import type { RideMarker } from '@loopra/domain';

export type StartPointGroup = Readonly<{
  id: string;
  lng: number;
  lat: number;
  rideIds: readonly string[];
}>;

export function groupByStartPoint(markers: readonly RideMarker[]): StartPointGroup[] {
  const groups = new Map<string, { lng: number; lat: number; rideIds: string[] }>();

  for (const { id: rideId, lng, lat } of markers) {
    const id = `${lng},${lat}`;
    const group = groups.get(id) ?? { lng, lat, rideIds: [] };

    group.rideIds.push(rideId);
    groups.set(id, group);
  }

  return [...groups].map(([id, group]) => ({ id, ...group }));
}
