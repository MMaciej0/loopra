import {
  boolean,
  geometry,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { GpxMetadata } from '@loopra/gpx';
import {
  BIKE_TYPES,
  DROP_POLICIES,
  EXPERIENCE_POLICIES,
  FORMATION_POLICIES,
  PACE_POLICIES,
  PARTICIPANT_STATUSES,
  RIDE_STATUSES,
  RIDE_TYPES,
} from '@loopra/domain';

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull().unique(),
  password_hash: text(),
  username: text(),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  email_verified: boolean().notNull().default(false),
  email_verified_at: timestamp({ withTimezone: true }),
});

export const selected_locations = pgTable('selected_locations', {
  user_id: uuid()
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  location: geometry({ type: 'point', mode: 'xy', srid: 4326 }).notNull(),
  city: text().notNull(),
  district: text(),
  municipality: text(),
  region: text(),
  country: text().notNull(),
  postal_code: text(),
});

export const favorite_locations = pgTable('favorite_locations', {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  location: geometry({ type: 'point', mode: 'xy', srid: 4326 }).notNull(),
  city: text().notNull(),
  district: text(),
  municipality: text(),
  region: text(),
  country: text().notNull(),
  postal_code: text(),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
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

export const rideTypeEnum = pgEnum('ride_type', RIDE_TYPES);
export const rideStatusEnum = pgEnum('ride_status', RIDE_STATUSES);
export const participantStatusEnum = pgEnum('participant_status', PARTICIPANT_STATUSES);
export const dropPolicyEnum = pgEnum('drop_policy', DROP_POLICIES);
export const pacePolicyEnum = pgEnum('pace_policy', PACE_POLICIES);
export const formationPolicyEnum = pgEnum('formation_policy', FORMATION_POLICIES);
export const experiencePolicyEnum = pgEnum('experience_policy', EXPERIENCE_POLICIES);
export const bikeTypeEnum = pgEnum('bike_type', BIKE_TYPES);

export const routes = pgTable('routes', {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid().references(() => users.id, { onDelete: 'set null' }),
  name: text().notNull(),
  s3_key: text().notNull().unique(),
  distance_km: numeric({ precision: 6, scale: 2 }),
  descent_m: numeric({ precision: 6, scale: 2 }),
  ascent_m: numeric({ precision: 6, scale: 2 }),
  point_count: integer(),
  elevation_profile: jsonb().$type<GpxMetadata['elevationProfile']>(),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const rides = pgTable(
  'rides',
  {
    id: uuid().primaryKey().defaultRandom(),
    title: text().notNull(),
    description: text(),
    creator_id: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    route_id: uuid().references(() => routes.id, { onDelete: 'set null' }),
    start_location: geometry({ type: 'point', mode: 'xy', srid: 4326 }),
    start_location_name: text(),
    city: text(),
    municipality: text(),
    region: text(),
    country: text(),
    postal_code: text(),
    full_address: text(),
    start_time: timestamp({ withTimezone: true, precision: 3 }).notNull(),
    end_time: timestamp({ withTimezone: true, precision: 3 }),
    distance_km: numeric({ precision: 6, scale: 2 }),
    average_pace_kmh: integer(),
    ride_type: rideTypeEnum().notNull(),
    bike_type: bikeTypeEnum().notNull(),
    drop_policy: dropPolicyEnum().notNull().default('no_drop'),
    pace_policy: pacePolicyEnum().notNull().default('slowest_rider'),
    formation_policy: formationPolicyEnum().notNull().default('free'),
    experience_policy: experiencePolicyEnum().notNull().default('first_timers'),
    max_participants: integer().notNull(),
    is_private: boolean().notNull().default(false),
    status: rideStatusEnum().notNull().default('open'),
    created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index('rides_start_location_idx').using('gist', t.start_location)],
);

export const ride_participants = pgTable(
  'ride_participants',
  {
    ride_id: uuid()
      .notNull()
      .references(() => rides.id, { onDelete: 'cascade' }),
    user_id: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: participantStatusEnum().notNull().default('confirmed'),
    joined_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.ride_id, t.user_id] })],
);

export const ridesRelations = relations(rides, ({ many, one }) => ({
  participants: many(ride_participants),
  creator: one(users, { fields: [rides.creator_id], references: [users.id] }),
  route: one(routes, { fields: [rides.route_id], references: [routes.id] }),
}));

export const rideParticipantsRelations = relations(ride_participants, ({ one }) => ({
  ride: one(rides, { fields: [ride_participants.ride_id], references: [rides.id] }),
  user: one(users, { fields: [ride_participants.user_id], references: [users.id] }),
}));

export const routesRelations = relations(routes, ({ one, many }) => ({
  user: one(users, { fields: [routes.user_id], references: [users.id] }),
  rides: many(rides),
}));
