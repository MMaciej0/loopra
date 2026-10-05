'use server';

import { RIDE_IDS_MAX, type ListRidesResponse, type RideListItem } from '@loopra/domain';
import { protectedRequest } from '@/lib/api';
import { toRideCard } from '@/features/rides/browse/components/rides-list/to-ride-card';
import { toSearchParams } from '@/features/rides/browse/to-search-params';

export async function loadRideCards(ids: readonly string[]) {
  const chunks = Array.from({ length: Math.ceil(ids.length / RIDE_IDS_MAX) }, (_, index) =>
    ids.slice(index * RIDE_IDS_MAX, (index + 1) * RIDE_IDS_MAX),
  );
  const responses = await Promise.all(
    chunks.map((chunk) =>
      protectedRequest<ListRidesResponse>(`/rides?${toSearchParams({ ids: chunk.join(',') })}`),
    ),
  );

  const rides: RideListItem[] = [];
  for (const response of responses) {
    if (!response.ok) {
      return { ok: false as const, errorType: response.errorType };
    }
    rides.push(...response.data.data);
  }

  const ridesById = new Map(rides.map((ride) => [ride.id, ride]));

  return {
    ok: true as const,
    cards: ids.flatMap((id) => {
      const ride = ridesById.get(id);
      return ride ? [{ id, data: toRideCard(ride) }] : [];
    }),
  };
}
