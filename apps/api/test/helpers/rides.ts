import { InferInsertModel } from 'drizzle-orm';
import { Db } from '../../src/db/index.js';
import { rides } from '../../src/db/schema.js';

type NewRideProps = Partial<InferInsertModel<typeof rides>> & { user_id: string };

const BIKE_TYPES = ['road', 'gravel', 'mtb', 'trekking'] as const;
const RIDE_TYPES = ['coffee_ride', 'sightseeing', 'casual', 'training'] as const;
const DROP_POLICIES = ['no_drop', 'regroup', 'drop'] as const;
const PACE_POLICIES = ['slowest_rider', 'leader', 'group_split'] as const;
const FORMATION_POLICIES = ['free', 'leader', 'rotation'] as const;
const EXPERIENCE_POLICIES = ['first_timers', 'moderate', 'advanced'] as const;

export const newRide = ({
  user_id,
  title,
  description,
  bike_type,
  ride_type,
  drop_policy,
  pace_policy,
  formation_policy,
  experience_policy,
  average_pace_kmh,
  start_location_name,
  start_time,
  start_location,
  end_time,
  city,
  region,
  country,
  max_participants,
}: NewRideProps) => {
  const pacePolicy = pace_policy || PACE_POLICIES[Math.floor(Math.random() * PACE_POLICIES.length)];

  return {
    creator_id: user_id,
    title: title || 'Test Ride',
    description: description || 'Test Description',
    bike_type: bike_type || BIKE_TYPES[Math.floor(Math.random() * BIKE_TYPES.length)],
    ride_type: ride_type || RIDE_TYPES[Math.floor(Math.random() * RIDE_TYPES.length)],
    drop_policy: drop_policy || DROP_POLICIES[Math.floor(Math.random() * DROP_POLICIES.length)],
    pace_policy: pacePolicy,
    formation_policy:
      formation_policy || FORMATION_POLICIES[Math.floor(Math.random() * FORMATION_POLICIES.length)],
    experience_policy:
      experience_policy ||
      EXPERIENCE_POLICIES[Math.floor(Math.random() * EXPERIENCE_POLICIES.length)],
    // leader-paced rides must carry a pace — see CreateRideBodySchema
    ...((average_pace_kmh || pacePolicy === 'leader') && {
      average_pace_kmh: average_pace_kmh || 28,
    }),
    start_location_name: start_location_name || 'Test Location',
    start_time: start_time || new Date(Date.now() + 6 * 60 * 60 * 1000),
    ...(start_location && { start_location }),
    ...(end_time && { end_time }),
    city: city || 'Warsaw',
    ...(region && { region }),
    country: country || 'Poland',
    ...(max_participants && { max_participants }),
  };
};

export const createMultipleRandomRides = (db: Db, count: number, user_id: string) => {
  const newRides = [];
  for (let i = 0; i < count; i++) {
    newRides.push(newRide({ user_id }));
  }

  return db.insert(rides).values(newRides).returning();
};
