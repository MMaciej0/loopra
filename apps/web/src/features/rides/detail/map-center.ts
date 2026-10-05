import type { Point, RideDetail } from '@loopra/domain';

export function mapCenter({ start_location, route }: RideDetail): Point | null {
  if (start_location) {
    return start_location;
  }

  const firstPoint = route?.path?.[0]?.[0];
  return firstPoint ? { x: firstPoint[0], y: firstPoint[1] } : null;
}
