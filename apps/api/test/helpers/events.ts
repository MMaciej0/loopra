import { InferInsertModel } from 'drizzle-orm';
import { Db } from '../../src/db/index.js';
import { events } from '../../src/db/schema.js';

type NewEventProps = Partial<InferInsertModel<typeof events>> & { user_id: string };

const BIKE_TYPES = ['road', 'gravel', 'mtb', 'trekking'] as const;
const DIFFICULTIES = ['easy', 'moderate', 'hard', 'expert'] as const;
const TYPE = ['trip', 'training'] as const;

export const newEvent = ({
  user_id,
  type,
  title,
  description,
  bike_type,
  difficulty,
  start_location_name,
  start_time,
  start_location,
}: NewEventProps) => ({
  creator_id: user_id,
  type: type || TYPE[Math.floor(Math.random() * TYPE.length)],
  title: title || 'Test Event',
  description: description || 'Test Description',
  bike_type: bike_type || BIKE_TYPES[Math.floor(Math.random() * BIKE_TYPES.length)],
  difficulty: difficulty || DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)],
  start_location_name: start_location_name || 'Test Location',
  start_time: start_time || new Date(),
  start_location: start_location || null,
});

export const createMultipleRandomEvents = (db: Db, count: number, user_id: string) => {
  const newEvents = [];
  for (let i = 0; i < count; i++) {
    newEvents.push(newEvent({ user_id }));
  }

  return db.insert(events).values(newEvents).returning();
};
