import { BIKE_TYPES, RIDE_TYPES, type BikeType, type RideType } from '@loopra/domain';
import { z } from 'zod';
import type { RidesView } from './view';

export type RidesFilters = Readonly<{
  bike_type?: BikeType;
  ride_type?: RideType;
}>;

export type RidesFilterKey = keyof RidesFilters;

export type RidesFilterParams = Readonly<Record<RidesFilterKey, string | string[] | undefined>>;

const RIDES_FILTER_KEYS = ['bike_type', 'ride_type'] as const satisfies readonly RidesFilterKey[];

const bikeTypeSchema = z.enum(BIKE_TYPES);
const rideTypeSchema = z.enum(RIDE_TYPES);

export function parseRidesFilters(searchParams: Partial<RidesFilterParams>): RidesFilters {
  const bikeType = bikeTypeSchema.safeParse(searchParams.bike_type);
  const rideType = rideTypeSchema.safeParse(searchParams.ride_type);

  return {
    ...(bikeType.success && { bike_type: bikeType.data }),
    ...(rideType.success && { ride_type: rideType.data }),
  };
}

export function withRidesFilter<Key extends RidesFilterKey>(
  filters: RidesFilters,
  key: Key,
  value: RidesFilters[Key] | undefined,
): RidesFilters {
  return parseRidesFilters({ ...filters, [key]: value });
}

export function ridesFiltersKey(filters: RidesFilters): string {
  return JSON.stringify(RIDES_FILTER_KEYS.map((key) => filters[key] ?? null));
}

export function ridesHref(view: RidesView, filters: RidesFilters) {
  return { pathname: '/rides' as const, query: { view, ...filters } };
}
