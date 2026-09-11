import type { Static } from 'typebox';
import type {
  ElevationProfileSchema,
  RouteSchema,
  CreateRouteResponseSchema,
} from '../schemas/route.js';

export type ElevationProfile = Static<typeof ElevationProfileSchema>;
export type Route = Static<typeof RouteSchema>;
export type CreateRouteResponse = Static<typeof CreateRouteResponseSchema>;
