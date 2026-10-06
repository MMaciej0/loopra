import type { RideListItem } from '@loopra/domain';
import type { RideCardData } from '@/features/rides/components/ride-card/types';

const toNumber = (value: string | null) => (value === null ? undefined : Number(value));

export function toRideCard(ride: RideListItem): RideCardData {
  return {
    ride_type: ride.ride_type,
    bike_type: ride.bike_type,
    drop_policy: ride.drop_policy,
    pace_policy: ride.pace_policy,
    experience_policy: ride.experience_policy,
    title: ride.title,
    start_time: new Date(ride.start_time),
    start_location_name: ride.start_location_name ?? undefined,
    distance_km: toNumber(ride.distance_km),
    average_pace_kmh: ride.average_pace_kmh ?? undefined,
    max_participants: ride.max_participants,
    elevation: ride.route
      ? { distance_km: toNumber(ride.route.distance_km), ascent_m: toNumber(ride.route.ascent_m) }
      : undefined,
    creator: ride.creator.username ? { name: ride.creator.username } : undefined,
    participant_count: ride.participant_count,
  };
}
