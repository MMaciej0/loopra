import { formatBBox, MIN_LEAD_HOURS, type BBox, type RideStatus } from '@loopra/domain';

const PAGE_SIZE = 24;
const HOUR_MS = 60 * 60 * 1000;

export type RidesListQuery = Readonly<{
  bbox: string;
  date_from: string;
  status: RideStatus;
  limit: number;
}>;

export function buildRidesListQuery(searchArea: BBox): RidesListQuery {
  return {
    bbox: formatBBox(searchArea),
    date_from: new Date(Date.now() + MIN_LEAD_HOURS * HOUR_MS).toISOString(),
    status: 'open',
    limit: PAGE_SIZE,
  };
}

export function ridesListKey({ bbox, status, limit }: RidesListQuery): string {
  return JSON.stringify([bbox, status, limit]);
}
