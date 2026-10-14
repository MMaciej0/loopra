import type { z } from 'zod';
import type {
  ElevationProfileSchema,
  RoutePathSchema,
  RouteSchema,
  CreateRouteResponseSchema,
} from '../schemas/route.js';

export type ElevationProfile = z.output<typeof ElevationProfileSchema>;
export type RoutePath = z.output<typeof RoutePathSchema>;
export type Route = z.output<typeof RouteSchema>;
export type CreateRouteResponse = z.output<typeof CreateRouteResponseSchema>;
