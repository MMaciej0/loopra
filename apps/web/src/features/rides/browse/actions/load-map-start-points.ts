'use server';

import { ListRideMarkersResponseSchema } from '@loopra/domain/schemas';
import { protectedRequest } from '@/lib/api';
import { groupByStartPoint } from '@/features/rides/browse/components/rides-map/start-points';
import { toApiFilters } from '@/features/rides/browse/filters';
import { toSearchParams } from '@/features/rides/to-search-params';
import type { RidesListQuery } from '@/features/rides/browse/list-query';
import type { RidesTimeWindow } from '@/features/rides/browse/time-window';

export async function loadMapStartPoints(
  { bbox, filters }: RidesListQuery,
  timeWindow: RidesTimeWindow,
) {
  const response = await protectedRequest(
    `/rides/markers?${toSearchParams({ bbox, ...toApiFilters(filters), ...timeWindow })}`,
    { schema: ListRideMarkersResponseSchema },
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
