import bcrypt from 'bcrypt';
import { count } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import {
  favorite_locations,
  ride_participants,
  rides,
  selected_locations,
  users,
} from './schema.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');
if (process.env.NODE_ENV === 'production') throw new Error('Refusing to seed in production');

const PASSWORD = 'Loopra-dev-123';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const atDaysFromNow = (days: number, hour: number) => {
  const date = new Date(Date.now() + days * DAY);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const krakow = { city: 'Kraków', region: 'Lesser Poland', country: 'Poland' };

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

try {
  const [{ value: userCount }] = await db.select({ value: count() }).from(users);
  if (userCount > 0) throw new Error('The database already has users, seed only an empty one');

  await db.transaction(async (tx) => {
    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    const [dev, anna, bartek, kasia] = await tx
      .insert(users)
      .values(
        ['dev', 'anna', 'bartek', 'kasia'].map((username) => ({
          email: `${username}@loopra.test`,
          username,
          password_hash: passwordHash,
          email_verified: true,
          email_verified_at: new Date(),
        })),
      )
      .returning();

    await tx.insert(selected_locations).values([
      { user_id: dev.id, location: { x: 20.037, y: 50.072 }, district: 'Nowa Huta', ...krakow },
      {
        user_id: anna.id,
        location: { x: 19.9373, y: 50.0617 },
        district: 'Stare Miasto',
        ...krakow,
      },
      { user_id: bartek.id, location: { x: 19.913, y: 50.037 }, district: 'Dębniki', ...krakow },
    ]);

    await tx.insert(favorite_locations).values([
      { user_id: dev.id, location: { x: 20.037, y: 50.072 }, district: 'Nowa Huta', ...krakow },
      {
        user_id: dev.id,
        location: { x: 19.9373, y: 50.0617 },
        district: 'Stare Miasto',
        ...krakow,
      },
      {
        user_id: dev.id,
        location: { x: 20.0651, y: 49.987 },
        city: 'Wieliczka',
        region: 'Lesser Poland',
        country: 'Poland',
      },
    ]);

    const seeded = await tx
      .insert(rides)
      .values([
        {
          title: 'Sunday coffee loop to Tyniec',
          description: 'Easy pace along the Vistula, coffee at the abbey.',
          creator_id: dev.id,
          start_location: { x: 19.9373, y: 50.0617 },
          start_location_name: 'Rynek Główny',
          ...krakow,
          start_time: atDaysFromNow(2, 9),
          distance_km: '32',
          average_pace_kmh: 22,
          ride_type: 'coffee_ride',
          bike_type: 'any',
          max_participants: 12,
        },
        {
          title: 'Ojców valley gravel',
          creator_id: anna.id,
          start_location: { x: 19.9286, y: 50.0905 },
          start_location_name: 'Bronowice',
          ...krakow,
          start_time: atDaysFromNow(4, 8),
          distance_km: '68',
          average_pace_kmh: 21,
          ride_type: 'sightseeing',
          bike_type: 'gravel',
          drop_policy: 'regroup',
          experience_policy: 'moderate',
          max_participants: 8,
        },
        {
          title: 'Tuesday intervals in Nowa Huta',
          description: 'Hard efforts, no waiting.',
          creator_id: bartek.id,
          start_location: { x: 20.037, y: 50.072 },
          start_location_name: 'Plac Centralny',
          ...krakow,
          start_time: atDaysFromNow(5, 18),
          distance_km: '45',
          average_pace_kmh: 32,
          ride_type: 'training',
          bike_type: 'road',
          drop_policy: 'drop',
          pace_policy: 'leader',
          formation_policy: 'rotation',
          experience_policy: 'advanced',
          max_participants: 6,
        },
        {
          title: 'Niepołomice forest spin',
          creator_id: kasia.id,
          start_location: { x: 20.2186, y: 50.0342 },
          start_location_name: 'Zamek Królewski',
          city: 'Niepołomice',
          region: 'Lesser Poland',
          country: 'Poland',
          start_time: atDaysFromNow(7, 10),
          distance_km: '40',
          average_pace_kmh: 20,
          ride_type: 'casual',
          bike_type: 'trekking',
          max_participants: 3,
        },
        {
          title: 'Kopiec Kościuszki sunset climb',
          creator_id: dev.id,
          start_location: { x: 19.917, y: 50.06 },
          start_location_name: 'Błonia',
          ...krakow,
          start_time: atDaysFromNow(10, 17),
          distance_km: '18',
          average_pace_kmh: 18,
          ride_type: 'sightseeing',
          bike_type: 'urban',
          max_participants: 15,
        },
        {
          title: 'Wieliczka salt mine ride',
          creator_id: anna.id,
          start_location: { x: 20.0651, y: 49.987 },
          start_location_name: 'Rynek Górny',
          city: 'Wieliczka',
          region: 'Lesser Poland',
          country: 'Poland',
          start_time: atDaysFromNow(6, 11),
          distance_km: '35',
          average_pace_kmh: 20,
          ride_type: 'casual',
          bike_type: 'any',
          max_participants: 10,
          status: 'cancelled',
        },
        {
          title: 'Last week: Vistula boulevards',
          creator_id: dev.id,
          start_location: { x: 19.9383, y: 50.0505 },
          start_location_name: 'Bulwar Czerwieński',
          ...krakow,
          start_time: atDaysFromNow(-7, 9),
          distance_km: '25',
          average_pace_kmh: 19,
          ride_type: 'casual',
          bike_type: 'any',
          max_participants: 10,
        },
      ])
      .returning({ id: rides.id, creator_id: rides.creator_id });

    const [coffee, ojcow, intervals, forest, , , boulevards] = seeded;

    await tx
      .insert(ride_participants)
      .values([
        ...seeded.map((ride) => ({ ride_id: ride.id, user_id: ride.creator_id })),
        { ride_id: coffee.id, user_id: anna.id },
        { ride_id: coffee.id, user_id: kasia.id },
        { ride_id: ojcow.id, user_id: dev.id },
        { ride_id: intervals.id, user_id: dev.id },
        { ride_id: forest.id, user_id: dev.id },
        { ride_id: forest.id, user_id: bartek.id },
        { ride_id: boulevards.id, user_id: anna.id },
      ]);
  });

  console.log(`Seeded. Log in as dev@loopra.test, anna@, bartek@ or kasia@ with ${PASSWORD}`);
} catch (error) {
  console.error('Seed failed', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
