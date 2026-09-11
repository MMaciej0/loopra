import { Type } from 'typebox';

export const ElevationProfileSchema = Type.Array(
  Type.Array(Type.Tuple([Type.Number(), Type.Number()])),
);

export const RouteSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    user_id: Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
    name: Type.String(),
    distance_km: Type.String(),
    ascent_m: Type.String(),
    descent_m: Type.String(),
    point_count: Type.Integer(),
    elevation_profile: ElevationProfileSchema,
  },
  { additionalProperties: false },
);

export const CreateRouteResponseSchema = Type.Object(
  { data: RouteSchema },
  { additionalProperties: false },
);
