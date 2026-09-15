import { MIN_LEAD_HOURS, type RideStatus } from '@loopra/domain';

const NEARBY_RADIUS_KM = 5;
const PAGE_SIZE = 24;
const MINUTE_MS = 60 * 1000;

export type RidesListQuery = Readonly<{
  lat: number;
  lng: number;
  radius_km: number;
  date_from: string;
  status: RideStatus;
  limit: number;
}>;

export function buildRidesListQuery(favoriteLocation: { x: number; y: number }): RidesListQuery {
  const leadTimeEnd = Date.now() + MIN_LEAD_HOURS * 60 * MINUTE_MS;

  return {
    lat: favoriteLocation.y,
    lng: favoriteLocation.x,
    radius_km: NEARBY_RADIUS_KM,
    date_from: new Date(Math.ceil(leadTimeEnd / MINUTE_MS) * MINUTE_MS).toISOString(),
    status: 'open',
    limit: PAGE_SIZE,
  };
}
