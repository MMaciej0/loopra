import { z } from 'zod';
import {
  BIKE_TYPES,
  DROP_POLICIES,
  EXPERIENCE_POLICIES,
  FORMATION_POLICIES,
  PACE_POLICIES,
  PARTICIPANT_STATUSES,
  RIDE_STATUSES,
  RIDE_TYPES,
} from '../enums.js';
import { IsoDateTime } from './common.js';
import { ElevationProfileSchema, RoutePathSchema } from './route.js';

export const RiderSchema = z.object({
  id: z.uuid(),
  username: z.string().nullable(),
});

const participantShape = {
  ride_id: z.uuid(),
  user_id: z.uuid(),
  status: z.enum(PARTICIPANT_STATUSES),
  joined_at: IsoDateTime,
};

export const RideParticipantSchema = z.object(participantShape);

const rideShape = {
  id: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  creator_id: z.uuid(),
  route_id: z.uuid().nullable(),
  start_location: z.object({ x: z.number(), y: z.number() }).nullable(),
  start_location_name: z.string().nullable(),
  city: z.string().nullable(),
  municipality: z.string().nullable(),
  region: z.string().nullable(),
  country: z.string().nullable(),
  postal_code: z.string().nullable(),
  full_address: z.string().nullable(),
  start_time: IsoDateTime,
  end_time: IsoDateTime.nullable(),
  distance_km: z.string().nullable(),
  average_pace_kmh: z.int().nullable(),
  ride_type: z.enum(RIDE_TYPES),
  bike_type: z.enum(BIKE_TYPES),
  drop_policy: z.enum(DROP_POLICIES),
  pace_policy: z.enum(PACE_POLICIES),
  formation_policy: z.enum(FORMATION_POLICIES),
  experience_policy: z.enum(EXPERIENCE_POLICIES),
  max_participants: z.int(),
  is_private: z.boolean(),
  status: z.enum(RIDE_STATUSES),
  created_at: IsoDateTime,
  updated_at: IsoDateTime,
};

export const RideSchema = z.object(rideShape);

const routeStatsShape = {
  distance_km: z.string().nullable(),
  ascent_m: z.string().nullable(),
};

export const RideRouteSchema = z.object({
  id: z.uuid(),
  path: RoutePathSchema.nullable(),
  elevation_profile: ElevationProfileSchema.nullable(),
  max_elevation_m: z.int().nullable(),
  min_elevation_m: z.int().nullable(),
  ...routeStatsShape,
});

export const RideDetailSchema = z.object({
  ...rideShape,
  creator: RiderSchema,
  route: RideRouteSchema.nullable(),
  participants: z.array(z.object({ ...participantShape, user: RiderSchema })),
});

export const RideListItemSchema = z.object({
  ...rideShape,
  creator: RiderSchema,
  participant_count: z.int(),
  route: z.object({ id: z.uuid(), ...routeStatsShape }).nullable(),
});

export const ListRidesResponseSchema = z.object({
  data: z.array(RideListItemSchema),
  nextCursor: z.string().nullable(),
});

export const RideMarkerSchema = z.object({
  id: z.uuid(),
  lng: z.number(),
  lat: z.number(),
});

export const ListRideMarkersResponseSchema = z.object({
  data: z.array(RideMarkerSchema),
  truncated: z.boolean(),
});

export const RideResponseSchema = z.object({ data: RideSchema });

export const RideDetailResponseSchema = z.object({ data: RideDetailSchema });

export const RideParticipantResponseSchema = z.object({ data: RideParticipantSchema });
