import { Type } from 'typebox';
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
import { RoutePathSchema } from './route.js';

const StringEnum = <T extends readonly string[]>(values: T) =>
  Type.Unsafe<T[number]>({ type: 'string', enum: [...values] });

const Nullable = <T extends ReturnType<typeof Type.String>>(schema: T) =>
  Type.Union([schema, Type.Null()]);

const riderProperties = {
  id: Type.String({ format: 'uuid' }),
  username: Type.Union([Type.String(), Type.Null()]),
} as const;

export const RiderSchema = Type.Object(riderProperties, { additionalProperties: false });

export const RideCreatorSchema = Type.Object(
  { ...riderProperties, email: Type.String() },
  { additionalProperties: false },
);

const participantProperties = {
  ride_id: Type.String({ format: 'uuid' }),
  user_id: Type.String({ format: 'uuid' }),
  status: StringEnum(PARTICIPANT_STATUSES),
  joined_at: Type.String({ format: 'date-time' }),
} as const;

export const RideParticipantSchema = Type.Object(participantProperties, {
  additionalProperties: false,
});

const rideProperties = {
  id: Type.String({ format: 'uuid' }),
  title: Type.String(),
  description: Nullable(Type.String()),
  creator_id: Type.String({ format: 'uuid' }),
  route_id: Nullable(Type.String({ format: 'uuid' })),
  start_location: Type.Union([
    Type.Object({ x: Type.Number(), y: Type.Number() }, { additionalProperties: false }),
    Type.Null(),
  ]),
  start_location_name: Nullable(Type.String()),
  city: Nullable(Type.String()),
  municipality: Nullable(Type.String()),
  region: Nullable(Type.String()),
  country: Nullable(Type.String()),
  postal_code: Nullable(Type.String()),
  full_address: Nullable(Type.String()),
  start_time: Type.String({ format: 'date-time' }),
  end_time: Nullable(Type.String({ format: 'date-time' })),
  distance_km: Nullable(Type.String()),
  average_pace_kmh: Type.Union([Type.Integer(), Type.Null()]),
  ride_type: StringEnum(RIDE_TYPES),
  bike_type: StringEnum(BIKE_TYPES),
  drop_policy: StringEnum(DROP_POLICIES),
  pace_policy: StringEnum(PACE_POLICIES),
  formation_policy: StringEnum(FORMATION_POLICIES),
  experience_policy: StringEnum(EXPERIENCE_POLICIES),
  max_participants: Type.Integer(),
  is_private: Type.Boolean(),
  status: StringEnum(RIDE_STATUSES),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
} as const;

export const RideSchema = Type.Object(rideProperties, { additionalProperties: false });

const routeStatsProperties = {
  distance_km: Nullable(Type.String()),
  ascent_m: Nullable(Type.String()),
} as const;

export const RideRouteSchema = Type.Object(
  { path: Type.Union([RoutePathSchema, Type.Null()]), ...routeStatsProperties },
  { additionalProperties: false },
);

export const RideDetailSchema = Type.Object(
  {
    ...rideProperties,
    creator: RideCreatorSchema,
    route: Type.Union([RideRouteSchema, Type.Null()]),
    participants: Type.Array(
      Type.Object({ ...participantProperties, user: RiderSchema }, { additionalProperties: false }),
    ),
  },
  { additionalProperties: false },
);

export const RideListItemSchema = Type.Object(
  {
    ...rideProperties,
    creator: RiderSchema,
    participant_count: Type.Integer(),
    route: Type.Union([
      Type.Object(routeStatsProperties, { additionalProperties: false }),
      Type.Null(),
    ]),
  },
  { additionalProperties: false },
);

export const ListRidesResponseSchema = Type.Object(
  {
    data: Type.Array(RideListItemSchema),
    nextCursor: Type.Union([Type.String(), Type.Null()]),
  },
  { additionalProperties: false },
);

export const RideMarkerSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    lng: Type.Number(),
    lat: Type.Number(),
  },
  { additionalProperties: false },
);

export const ListRideMarkersResponseSchema = Type.Object(
  {
    data: Type.Array(RideMarkerSchema),
    truncated: Type.Boolean(),
  },
  { additionalProperties: false },
);

export const RideResponseSchema = Type.Object(
  { data: RideSchema },
  { additionalProperties: false },
);

export const RideDetailResponseSchema = Type.Object(
  { data: RideDetailSchema },
  { additionalProperties: false },
);

export const RideParticipantResponseSchema = Type.Object(
  { data: RideParticipantSchema },
  { additionalProperties: false },
);
