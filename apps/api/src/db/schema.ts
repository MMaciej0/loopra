import {
  boolean,
  geometry,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull().unique(),
  password_hash: text(),
  username: text(),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  email_verified: boolean().notNull().default(false),
  email_verified_at: timestamp({ withTimezone: true }),
});

export const oauth_accounts = pgTable(
  'oauth_accounts',
  {
    id: uuid().primaryKey().defaultRandom(),
    user_id: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text().notNull(),
    provider_user_id: text().notNull(),
    created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.provider, t.provider_user_id)],
);

export const rideTypeEnum = pgEnum('ride_type', [
  'coffee_ride',
  'sightseeing',
  'casual',
  'training',
]);
export const eventStatusEnum = pgEnum('event_status', [
  'draft',
  'open',
  'full',
  'cancelled',
  'completed',
]);
export const participantStatusEnum = pgEnum('participant_status', [
  'pending',
  'confirmed',
  'declined',
]);
export const dropPolicyEnum = pgEnum('drop_policy', ['no_drop', 'regroup', 'drop']);
export const bikeTypeEnum = pgEnum('bike_type', [
  'road',
  'gravel',
  'mtb',
  'trekking',
  'urban',
  'electric',
  'cyclocross',
  'tt',
]);

export const events = pgTable('events', {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  description: text(),
  creator_id: uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  start_location: geometry({ type: 'point', mode: 'xy', srid: 4326 }),
  start_location_name: text(),
  city: text(),
  municipality: text(),
  region: text(),
  country: text(),
  postal_code: text(),
  full_address: text(),
  start_time: timestamp({ withTimezone: true }).notNull(),
  end_time: timestamp({ withTimezone: true }),
  distance_km: numeric({ precision: 6, scale: 2 }),
  pace_kmh: integer(),
  ride_type: rideTypeEnum().notNull(),
  bike_type: bikeTypeEnum(),
  drop_policy: dropPolicyEnum().notNull().default('no_drop'),
  max_participants: integer(), // null = unlimited
  is_private: boolean().notNull().default(false),
  status: eventStatusEnum().notNull().default('open'),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const event_participants = pgTable(
  'event_participants',
  {
    event_id: uuid()
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    user_id: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: participantStatusEnum().notNull().default('confirmed'),
    joined_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.event_id, t.user_id] })],
);

export const eventsRelations = relations(events, ({ many, one }) => ({
  participants: many(event_participants),
  creator: one(users, { fields: [events.creator_id], references: [users.id] }),
}));

export const eventParticipantsRelations = relations(event_participants, ({ one }) => ({
  event: one(events, { fields: [event_participants.event_id], references: [events.id] }),
  user: one(users, { fields: [event_participants.user_id], references: [users.id] }),
}));
