import type { Static } from 'typebox';
import type {
  ElevationProfileSchema,
  RoutePathSchema,
  RouteSchema,
  CreateRouteResponseSchema,
} from '../schemas/route.js';

export type ElevationProfile = Static<typeof ElevationProfileSchema>;
export type RoutePath = Static<typeof RoutePathSchema>;
export type Route = Static<typeof RouteSchema>;
export type CreateRouteResponse = Static<typeof CreateRouteResponseSchema>;
