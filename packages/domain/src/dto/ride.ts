import type { Static } from 'typebox';
import type {
  ListRidesResponseSchema,
  RideDetailResponseSchema,
  RideDetailSchema,
  RideListItemSchema,
  RideParticipantResponseSchema,
  RideParticipantSchema,
  RideResponseSchema,
  RideSchema,
  RiderSchema,
} from '../schemas/ride.js';

export type Rider = Static<typeof RiderSchema>;
export type RideParticipant = Static<typeof RideParticipantSchema>;
export type Ride = Static<typeof RideSchema>;
export type RideDetail = Static<typeof RideDetailSchema>;
export type RideListItem = Static<typeof RideListItemSchema>;
export type ListRidesResponse = Static<typeof ListRidesResponseSchema>;
export type RideResponse = Static<typeof RideResponseSchema>;
export type RideDetailResponse = Static<typeof RideDetailResponseSchema>;
export type RideParticipantResponse = Static<typeof RideParticipantResponseSchema>;
