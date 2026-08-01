import { InferInsertModel } from 'drizzle-orm';
import { Db } from '../../src/db/index.js';
import { events } from '../../src/db/schema.js';

type NewEventProps = Partial<InferInsertModel<typeof events>> & { user_id: string };

const BIKE_TYPES = ['road', 'gravel', 'mtb', 'trekking'] as const;
const RIDE_TYPES = ['coffee_ride', 'sightseeing', 'casual', 'training'] as const;
const DROP_POLICIES = ['no_drop', 'regroup', 'drop'] as const;

export const newEvent = ({
  user_id,
  title,
  description,
  bike_type,
  ride_type,
  drop_policy,
  start_location_name,
  start_time,
  start_location,
  end_time,
  city,
  region,
  country,
  max_participants,
}: NewEventProps) => ({
  creator_id: user_id,
  title: title || 'Test Event',
  description: description || 'Test Description',
  bike_type: bike_type || BIKE_TYPES[Math.floor(Math.random() * BIKE_TYPES.length)],
  ride_type: ride_type || RIDE_TYPES[Math.floor(Math.random() * RIDE_TYPES.length)],
  drop_policy: drop_policy || DROP_POLICIES[Math.floor(Math.random() * DROP_POLICIES.length)],
  start_location_name: start_location_name || 'Test Location',
  start_time: start_time || new Date(Date.now() + 6 * 60 * 60 * 1000),
  ...(start_location && { start_location }),
  ...(end_time && { end_time }),
  city: city || 'Warsaw',
  ...(region && { region }),
  country: country || 'Poland',
  ...(max_participants && { max_participants }),
});

export const createMultipleRandomEvents = (db: Db, count: number, user_id: string) => {
  const newEvents = [];
  for (let i = 0; i < count; i++) {
    newEvents.push(newEvent({ user_id }));
  }

  return db.insert(events).values(newEvents).returning();
};
