import type { RideCardData } from '@/features/rides/ride-card/types';
import type { CreateRideInput } from '@/features/rides/create/schema';

export function toRideCard(values: CreateRideInput): RideCardData {
  return {
    ride_type: values.ride_type,
    bike_type: values.bike_type,
    drop_policy: values.drop_policy,
    pace_policy: values.pace_policy,
    experience_policy: values.experience_policy,
    title: values.title,
    start_time: values.start_time,
    start_location_name: values.start_location_name,
    distance_km: values.distance_km,
    average_pace_kmh: values.average_pace_kmh,
    max_participants: values.max_participants,
    elevation: values.route && {
      distance_km: Number(values.route.distance_km),
      ascent_m: Number(values.route.ascent_m),
      profile: values.route.elevation_profile,
    },
  };
}
