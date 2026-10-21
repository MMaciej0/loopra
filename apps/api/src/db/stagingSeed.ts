import { readFileSync } from 'node:fs';
import { S3Client } from '@aws-sdk/client-s3';
import { and, count, eq, gt, inArray, max } from 'drizzle-orm';
import type { AppEnv } from '@loopra/domain';
import { parseGPX } from '@loopra/gpx';
import { Db } from './index.js';
import { rides, routes, users } from './schema.js';
import { CreateRideBody, CreateRideBodySchema } from '../modules/rides/schema.js';
import { createRide } from '../modules/rides/services/createRide.js';
import { joinRide } from '../modules/rides/services/joinRide.js';
import { createRoute } from '../modules/routes/services/createRoute.js';

export const STAGING_SEED_FUTURE_RIDES = 10;

const SPACING_DAYS = 2;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const ROUTES_DIR = new URL('./staging-routes/', import.meta.url);

const ORGANISERS = [
  'marta',
  'tomek',
  'ola',
  'piotr',
  'zosia',
  'kuba',
  'ewa',
  'michal',
  'natalia',
  'wojtek',
].map((username) => ({ username, email: `${username}@seed.loopra.cc` }));

const krakow = { city: 'Kraków', region: 'Lesser Poland', country: 'Poland' };

const RYNEK = { start_location: { x: 19.9373, y: 50.0617 }, start_location_name: 'Rynek Główny' };
const BLONIA = { start_location: { x: 19.912, y: 50.0605 }, start_location_name: 'Błonia' };
const PLAC_CENTRALNY = {
  start_location: { x: 20.0377, y: 50.0725 },
  start_location_name: 'Plac Centralny',
};
const RYNEK_PODGORSKI = {
  start_location: { x: 19.953, y: 50.045 },
  start_location_name: 'Rynek Podgórski',
};
const PLAC_NOWY = { start_location: { x: 19.9446, y: 50.0516 }, start_location_name: 'Plac Nowy' };

const easy = {
  drop_policy: 'no_drop',
  pace_policy: 'slowest_rider',
  formation_policy: 'free',
  experience_policy: 'first_timers',
} as const;

type Template = {
  organiser: number;
  participants: number;
  utcHour: number;
  routeFile: string;
  ride: Omit<
    CreateRideBody,
    'start_time' | 'route_id' | 'distance_km' | 'city' | 'region' | 'country' | 'is_private'
  >;
};

const TEMPLATES: Template[] = [
  {
    organiser: 0,
    participants: 8,
    utcHour: 7,
    routeFile: 'las-wolski-coffee-loop.gpx',
    ride: {
      title: 'Coffee loop over Las Wolski',
      description: 'Up to Kościuszko Mound, through the forest, coffee back in town.',
      ...RYNEK,
      ride_type: 'coffee_ride',
      bike_type: 'any',
      ...easy,
      average_pace_kmh: 20,
      max_participants: 8,
    },
  },
  {
    organiser: 1,
    participants: 3,
    utcHour: 6,
    routeFile: 'ojcow-training.gpx',
    ride: {
      title: 'Ojców valley training',
      description: 'Long climbs north of the city. Steady tempo, we regroup at the top.',
      ...RYNEK,
      ride_type: 'training',
      bike_type: 'road',
      drop_policy: 'regroup',
      pace_policy: 'leader',
      formation_policy: 'rotation',
      experience_policy: 'advanced',
      average_pace_kmh: 28,
      max_participants: 6,
    },
  },
  {
    organiser: 2,
    participants: 1,
    utcHour: 15,
    routeFile: 'old-town-sightseeing.gpx',
    ride: {
      title: 'Old Town and Kazimierz by bike',
      description: 'Slow ride past Wawel, Kazimierz and Podgórze, with stops for photos.',
      ...RYNEK,
      ride_type: 'sightseeing',
      bike_type: 'urban',
      ...easy,
      average_pace_kmh: 14,
      max_participants: 12,
    },
  },
  {
    organiser: 3,
    participants: 4,
    utcHour: 8,
    routeFile: 'vistula-bagry-loop.gpx',
    ride: {
      title: 'Flat Vistula ride to Bagry',
      description: 'Along the river to the lake and back. Good for a first group ride.',
      ...PLAC_NOWY,
      ride_type: 'casual',
      bike_type: 'any',
      ...easy,
      average_pace_kmh: 18,
      max_participants: 10,
    },
  },
  {
    organiser: 4,
    participants: 4,
    utcHour: 15,
    routeFile: 'wieliczka-hills-training.gpx',
    ride: {
      title: 'Wieliczka hill repeats',
      description: 'Hard climbs south of Kraków. No waiting on the hills.',
      ...RYNEK_PODGORSKI,
      ride_type: 'training',
      bike_type: 'road',
      drop_policy: 'drop',
      pace_policy: 'leader',
      formation_policy: 'leader',
      experience_policy: 'advanced',
      average_pace_kmh: 30,
      max_participants: 4,
    },
  },
  {
    organiser: 5,
    participants: 1,
    utcHour: 9,
    routeFile: 'nowa-huta-wanda-loop.gpx',
    ride: {
      title: 'Nowa Huta and Wanda Mound',
      description: 'Easy loop through Nowa Huta, with a stop on the mound.',
      ...PLAC_CENTRALNY,
      ride_type: 'casual',
      bike_type: 'trekking',
      ...easy,
      average_pace_kmh: 18,
      max_participants: 15,
    },
  },
  {
    organiser: 6,
    participants: 6,
    utcHour: 7,
    routeFile: 'vistula-tyniec-loop.gpx',
    ride: {
      title: 'Coffee at Tyniec Abbey',
      description: 'Along the Vistula to the abbey, coffee, and back on the other bank.',
      ...BLONIA,
      ride_type: 'coffee_ride',
      bike_type: 'any',
      ...easy,
      average_pace_kmh: 21,
      max_participants: 6,
    },
  },
  {
    organiser: 7,
    participants: 2,
    utcHour: 6,
    routeFile: 'tenczynek-alwernia-training.gpx',
    ride: {
      title: 'Tenczynek and Alwernia long ride',
      description: 'Long ride west of Kraków. Rotating pace line on the flat parts.',
      ...BLONIA,
      ride_type: 'training',
      bike_type: 'road',
      drop_policy: 'regroup',
      pace_policy: 'group_split',
      formation_policy: 'rotation',
      experience_policy: 'moderate',
      average_pace_kmh: 27,
      max_participants: 8,
    },
  },
  {
    organiser: 8,
    participants: 1,
    utcHour: 8,
    routeFile: 'niepolomice-forest-loop.gpx',
    ride: {
      title: 'Niepołomice Forest gravel',
      description: 'Forest roads east of the city. Gravel or trekking bikes are best.',
      ...PLAC_CENTRALNY,
      ride_type: 'casual',
      bike_type: 'gravel',
      ...easy,
      average_pace_kmh: 20,
      max_participants: 10,
    },
  },
  {
    organiser: 9,
    participants: 3,
    utcHour: 16,
    routeFile: 'old-town-sightseeing.gpx',
    ride: {
      title: 'Evening lights in Kraków',
      description: 'The Old Town and the river after sunset. Bring lights.',
      ...RYNEK,
      ride_type: 'sightseeing',
      bike_type: 'any',
      ...easy,
      average_pace_kmh: 14,
      max_participants: 5,
    },
  },
  {
    organiser: 0,
    participants: 2,
    utcHour: 8,
    routeFile: 'nowa-huta-wanda-loop.gpx',
    ride: {
      title: 'Nowa Huta coffee ride',
      description: 'Short and flat, with a long coffee stop at the end.',
      ...PLAC_CENTRALNY,
      ride_type: 'coffee_ride',
      bike_type: 'any',
      ...easy,
      average_pace_kmh: 18,
      max_participants: 6,
    },
  },
  {
    organiser: 3,
    participants: 10,
    utcHour: 6,
    routeFile: 'ojcow-training.gpx',
    ride: {
      title: 'Pieskowa Skała castle ride',
      description: 'Club pace to the castle and back, with a lunch stop.',
      ...RYNEK,
      ride_type: 'training',
      bike_type: 'road',
      drop_policy: 'regroup',
      pace_policy: 'slowest_rider',
      formation_policy: 'free',
      experience_policy: 'moderate',
      average_pace_kmh: 25,
      max_participants: 10,
    },
  },
];

export const assertStagingSeedAllowed = (appEnv: AppEnv) => {
  if (appEnv !== 'staging' && appEnv !== 'development') {
    throw new Error(`Refusing to seed staging Rides with APP_ENV=${appEnv}`);
  }
};

const ensureOrganisers = async (db: Db) => {
  const verifiedAt = new Date();
  const inserted = await db
    .insert(users)
    .values(
      ORGANISERS.map(({ username, email }) => ({
        email,
        username,
        email_verified: true,
        email_verified_at: verifiedAt,
      })),
    )
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  const rows = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(
      inArray(
        users.email,
        ORGANISERS.map(({ email }) => email),
      ),
    );
  const idByEmail = new Map(rows.map((row) => [row.email, row.id]));

  return { created: inserted.length, ids: ORGANISERS.map(({ email }) => idByEmail.get(email)!) };
};

const ensureRoute = async (db: Db, s3: S3Client, organiserId: string, file: string) => {
  const buffer = readFileSync(new URL(file, ROUTES_DIR));
  const name = parseGPX(buffer.toString()).name!;

  const [existing] = await db
    .select({ id: routes.id, distance_km: routes.distance_km })
    .from(routes)
    .where(and(eq(routes.user_id, organiserId), eq(routes.name, name)));

  return existing ?? (await createRoute(db, s3, buffer, organiserId, file));
};

const startTimeAfter = (base: Date, index: number, utcHour: number) => {
  const startOfDay = Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate());
  return new Date(startOfDay + (index + 1) * SPACING_DAYS * DAY + utcHour * HOUR);
};

export const seedStaging = async (db: Db, s3: S3Client) => {
  const now = new Date();
  const organisers = await ensureOrganisers(db);

  const [stats] = await db
    .select({ total: count() })
    .from(rides)
    .where(inArray(rides.creator_id, organisers.ids));
  const [upcoming] = await db
    .select({ count: count(), latest: max(rides.start_time) })
    .from(rides)
    .where(and(inArray(rides.creator_id, organisers.ids), gt(rides.start_time, now)));

  const missing = Math.max(0, STAGING_SEED_FUTURE_RIDES - upcoming.count);
  const base = upcoming.latest ?? now;

  for (let i = 0; i < missing; i++) {
    const template = TEMPLATES[(stats.total + i) % TEMPLATES.length];
    const creatorId = organisers.ids[template.organiser];
    const route = await ensureRoute(db, s3, creatorId, template.routeFile);

    const body = CreateRideBodySchema.parse({
      ...template.ride,
      ...krakow,
      start_time: startTimeAfter(base, i, template.utcHour),
      distance_km: route.distance_km ?? undefined,
      route_id: route.id,
    });
    const ride = await createRide(db, creatorId, body);

    for (let j = 1; j < Math.min(template.participants, template.ride.max_participants); j++) {
      const riderId = organisers.ids[(template.organiser + j) % organisers.ids.length];
      await joinRide(db, riderId, ride.id);
    }
  }

  return { organisersCreated: organisers.created, ridesCreated: missing };
};
