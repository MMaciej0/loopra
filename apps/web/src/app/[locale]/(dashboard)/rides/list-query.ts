import { MIN_LEAD_HOURS, type RideStatus } from '@loopra/domain';

const NEARBY_RADIUS_KM = 5;
const PAGE_SIZE = 24;
const HOUR_MS = 60 * 60 * 1000;

export type RidesListQuery = Readonly<{
  lat: number;
  lng: number;
  radius_km: number;
  date_from: string;
  status: RideStatus;
  limit: number;
}>;

export function buildRidesListQuery(favoriteLocation: { x: number; y: number }): RidesListQuery {
  return {
    lat: favoriteLocation.y,
    lng: favoriteLocation.x,
    radius_km: NEARBY_RADIUS_KM,
    date_from: new Date(Date.now() + MIN_LEAD_HOURS * HOUR_MS).toISOString(),
    status: 'open',
    limit: PAGE_SIZE,
  };
}

export function ridesListKey({ lat, lng, radius_km, status, limit }: RidesListQuery): string {
  return JSON.stringify([lat, lng, radius_km, status, limit]);
}
