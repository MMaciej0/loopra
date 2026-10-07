'use server';

import type { ListRidesResponse } from '@loopra/domain';
import { protectedRequest } from '@/lib/api';
import { toRideCard } from '@/features/rides/browse/components/rides-list/to-ride-card';
import { toApiFilters } from '@/features/rides/browse/filters';
import { toSearchParams } from '@/features/rides/browse/to-search-params';
import type { RidesListQuery } from '@/features/rides/browse/list-query';
import type { RidesTimeWindow } from '@/features/rides/browse/time-window';

export async function loadRidesPage(
  { filters, ...query }: RidesListQuery,
  timeWindow: RidesTimeWindow,
  cursor: string | null,
) {
  const params = toSearchParams({ ...query, ...toApiFilters(filters), ...timeWindow });

  if (cursor) {
    params.set('cursor', cursor);
  }

  const response = await protectedRequest<ListRidesResponse>(`/rides?${params}`);

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  return {
    ok: true as const,
    cards: response.data.data.map((ride) => ({ id: ride.id, data: toRideCard(ride) })),
    nextCursor: response.data.nextCursor,
  };
}
