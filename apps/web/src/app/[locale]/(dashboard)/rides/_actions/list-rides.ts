'use server';

import type { ListRidesResponse, RideListItem } from '@loopra/domain';
import { protectedRequest } from '@/utils/api';
import { toRideCard } from '../_components/rides-list/to-ride-card';
import { groupByStartPoint } from '../_components/rides-map/start-points';
import type { RidesListQuery } from '../list-query';

const MAP_PAGE_SIZE = 100;
const MAP_RIDES_CEILING = 500;

function requestRidesPage(query: RidesListQuery, cursor: string | null) {
  const params = new URLSearchParams(
    Object.entries(query).map(([key, value]) => [key, String(value)]),
  );

  if (cursor) {
    params.set('cursor', cursor);
  }

  return protectedRequest<ListRidesResponse>(`/rides?${params}`);
}

export async function loadRidesPage(query: RidesListQuery, cursor: string | null) {
  const response = await requestRidesPage(query, cursor);

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  return {
    ok: true as const,
    cards: response.data.data.map((ride) => ({ id: ride.id, data: toRideCard(ride) })),
    nextCursor: response.data.nextCursor,
  };
}

export async function loadMapStartPoints(query: RidesListQuery) {
  const mapQuery = { ...query, limit: MAP_PAGE_SIZE };
  const rides: RideListItem[] = [];
  let cursor: string | null = null;

  do {
    const response = await requestRidesPage(mapQuery, cursor);

    if (!response.ok) {
      return { ok: false as const, errorType: response.errorType };
    }

    rides.push(...response.data.data);
    cursor = response.data.nextCursor;
  } while (cursor && rides.length < MAP_RIDES_CEILING);

  return {
    ok: true as const,
    startPoints: groupByStartPoint(rides.slice(0, MAP_RIDES_CEILING)),
  };
}
