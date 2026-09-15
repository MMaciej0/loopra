import type { BikeType, DropPolicy, ExperiencePolicy, PacePolicy, RideType } from '@loopra/domain';
import type { ElevationPoint } from './geometry';

export interface RideCardElevation {
  distance_km: number;
  ascent_m: number;
  profile: ElevationPoint[][];
}

export interface RideCardCreator {
  name: string;
  avatar_url?: string;
}

export interface RideCardData {
  ride_type: RideType;
  bike_type: BikeType;
  drop_policy: DropPolicy;
  pace_policy: PacePolicy;
  experience_policy: ExperiencePolicy;

  title?: string;
  start_time?: Date;
  start_location_name?: string;
  distance_km?: number;
  average_pace_kmh?: number;
  max_participants?: number;
  elevation?: RideCardElevation;
  creator?: RideCardCreator;
  participant_count?: number;
}
