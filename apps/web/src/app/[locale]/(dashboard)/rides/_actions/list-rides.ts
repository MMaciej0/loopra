'use server';

import type { ListRidesResponse } from '@loopra/domain';
import { protectedRequest } from '@/utils/api';
import { toRideCard } from '../_components/rides-list/to-ride-card';
import type { RidesListQuery } from '../list-query';

export async function loadRidesPage(query: RidesListQuery, cursor: string | null) {
  const params = new URLSearchParams(
    Object.entries(query).map(([key, value]) => [key, String(value)]),
  );

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
