'use server';

import {
  RIDE_IDS_MAX,
  type ListRideMarkersResponse,
  type ListRidesResponse,
  type RideListItem,
} from '@loopra/domain';
import { protectedRequest } from '@/lib/api';
import { toRideCard } from '../_components/rides-list/to-ride-card';
import { groupByStartPoint } from '../_components/rides-map/start-points';
import type { RidesListQuery } from '../list-query';

function toSearchParams(query: Readonly<Record<string, string | number>>) {
  return new URLSearchParams(Object.entries(query).map(([key, value]) => [key, String(value)]));
}

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
