import { z } from 'zod';

export const ElevationProfileSchema = z.array(z.array(z.tuple([z.number(), z.number()])));

export const RoutePathSchema = z.array(z.array(z.tuple([z.number(), z.number()])));

export const RouteSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid().nullable(),
  name: z.string(),
  distance_km: z.string(),
  ascent_m: z.string(),
  descent_m: z.string(),
  point_count: z.int(),
  elevation_profile: ElevationProfileSchema,
});

export const CreateRouteResponseSchema = z.object({ data: RouteSchema });
