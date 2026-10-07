import { formatBBox, type BBox, type RideStatus } from '@loopra/domain';
import { ridesFiltersKey, type RidesFilters } from './filters';

const PAGE_SIZE = 24;

export type RidesListQuery = Readonly<{
  bbox: string;
  date_from: string;
  status: RideStatus;
  limit: number;
  filters: RidesFilters;
}>;

export function buildRidesListQuery(searchArea: BBox, filters: RidesFilters): RidesListQuery {
  return {
    bbox: formatBBox(searchArea),
    date_from: new Date().toISOString(),
    status: 'open',
    limit: PAGE_SIZE,
    filters,
  };
}

export function ridesListKey({ bbox, status, limit, filters }: RidesListQuery): string {
  return JSON.stringify([bbox, status, limit, ridesFiltersKey(filters)]);
}

export function ridesMapKey({ bbox, status }: RidesListQuery): string {
  return JSON.stringify([bbox, status]);
}
