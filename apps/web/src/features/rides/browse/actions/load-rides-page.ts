'use server';

import type { ListRidesResponse } from '@loopra/domain';
import { protectedRequest } from '@/lib/api';
import { toRideCard } from '@/features/rides/browse/components/rides-list/to-ride-card';
import { toSearchParams } from '@/features/rides/browse/to-search-params';
import type { RidesListQuery } from '@/features/rides/browse/list-query';

export async function loadRidesPage(query: RidesListQuery, cursor: string | null) {
  const params = toSearchParams(query);

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
