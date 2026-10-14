import type { z } from 'zod';
import type {
  ListRideMarkersResponseSchema,
  ListRidesResponseSchema,
  RideDetailResponseSchema,
  RideDetailSchema,
  RideListItemSchema,
  RideMarkerSchema,
  RideParticipantResponseSchema,
  RideParticipantSchema,
  RideResponseSchema,
  RideRouteSchema,
  RideSchema,
  RiderSchema,
} from '../schemas/ride.js';

export type Rider = z.output<typeof RiderSchema>;
export type RideParticipant = z.output<typeof RideParticipantSchema>;
export type Ride = z.output<typeof RideSchema>;
export type RideRoute = z.output<typeof RideRouteSchema>;
export type RideDetail = z.output<typeof RideDetailSchema>;
export type RideListItem = z.output<typeof RideListItemSchema>;
export type RideMarker = z.output<typeof RideMarkerSchema>;
export type ListRideMarkersResponse = z.output<typeof ListRideMarkersResponseSchema>;
export type ListRidesResponse = z.output<typeof ListRidesResponseSchema>;
export type RideResponse = z.output<typeof RideResponseSchema>;
export type RideDetailResponse = z.output<typeof RideDetailResponseSchema>;
export type RideParticipantResponse = z.output<typeof RideParticipantResponseSchema>;
