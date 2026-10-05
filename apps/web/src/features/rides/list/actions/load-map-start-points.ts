'use server';

import type { ListRideMarkersResponse } from '@loopra/domain';
import { protectedRequest } from '@/lib/api';
import { groupByStartPoint } from '@/features/rides/map/start-points';
import { toSearchParams } from '@/features/rides/list/to-search-params';
import type { RidesListQuery } from '@/features/rides/list/list-query';

export async function loadMapStartPoints({ bbox, date_from, status }: RidesListQuery) {
  const response = await protectedRequest<ListRideMarkersResponse>(
    `/rides/markers?${toSearchParams({ bbox, date_from, status })}`,
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
