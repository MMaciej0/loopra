'use server';

import { ListRidesResponseSchema } from '@loopra/domain/schemas';
import { protectedRequest } from '@/lib/api';
import { toRideCard } from '@/features/rides/components/ride-card/to-ride-card';
import { toSearchParams } from '@/features/rides/to-search-params';
import type { MyRidesFilters } from '@/features/rides/my-rides/filters';

const PAGE_SIZE = 24;

export async function loadMyRidesPage(filters: MyRidesFilters, cursor: string | null) {
  const params = toSearchParams({ ...filters, limit: PAGE_SIZE, cursor: cursor ?? undefined });
  const response = await protectedRequest(`/rides/mine?${params}`, {
    schema: ListRidesResponseSchema,
  });

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  return {
    ok: true as const,
    rides: response.data.data.map((ride) => ({
      id: ride.id,
      organiserId: ride.creator_id,
      data: { ...toRideCard(ride), status: ride.status },
    })),
    nextCursor: response.data.nextCursor,
  };
}
