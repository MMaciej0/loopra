'use server';

import type { ListRideMarkersResponse } from '@loopra/domain';
import { protectedRequest } from '@/lib/api';
import { groupByStartPoint } from '@/features/rides/browse/components/rides-map/start-points';
import { toApiFilters } from '@/features/rides/browse/filters';
import { toSearchParams } from '@/features/rides/browse/to-search-params';
import type { RidesListQuery } from '@/features/rides/browse/list-query';
import type { RidesTimeWindow } from '@/features/rides/browse/time-window';

export async function loadMapStartPoints(
  { bbox, status, filters }: RidesListQuery,
  timeWindow: RidesTimeWindow,
) {
  const response = await protectedRequest<ListRideMarkersResponse>(
    `/rides/markers?${toSearchParams({ bbox, status, ...toApiFilters(filters), ...timeWindow })}`,
  );

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  return {
    ok: true as const,
    startPoints: groupByStartPoint(response.data.data),
    truncated: response.data.truncated,
  };
}
