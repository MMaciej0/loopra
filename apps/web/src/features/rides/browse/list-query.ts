import { formatBBox, type BBox } from '@loopra/domain';
import { ridesFiltersKey, type RidesFilters } from './filters';

const PAGE_SIZE = 24;

export type RidesListQuery = Readonly<{
  bbox: string;
  limit: number;
  filters: RidesFilters;
}>;

export function buildRidesListQuery(searchArea: BBox, filters: RidesFilters): RidesListQuery {
  return {
    bbox: formatBBox(searchArea),
    limit: PAGE_SIZE,
    filters,
  };
}

export function ridesListKey({ bbox, limit, filters }: RidesListQuery): string {
  return JSON.stringify([bbox, limit, ridesFiltersKey(filters)]);
}

export function ridesMapKey({ bbox }: RidesListQuery): string {
  return JSON.stringify([bbox]);
}
