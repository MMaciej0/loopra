import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sql } from 'drizzle-orm';
import { MIN_LEAD_HOURS, RIDE_TYPES } from '@loopra/domain';
import { useApp } from '../helpers/app.js';
import { registerUser } from '../helpers/auth.js';
import { newRide } from '../helpers/rides.js';
import { rides } from '../../src/db/schema.js';
import { uploadToS3 } from '../../src/utils/s3.js';
import {
  assertStagingSeedAllowed,
  seedStaging,
  STAGING_SEED_FUTURE_RIDES,
} from '../../src/db/stagingSeed.js';

vi.mock('../../src/utils/s3.js');

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

describe('assertStagingSeedAllowed', () => {
  it('refuses production', () => {
    expect(() => assertStagingSeedAllowed('production')).toThrow();
  });

  it.each(['staging', 'development'] as const)('allows %s', (appEnv) => {
    expect(() => assertStagingSeedAllowed(appEnv)).not.toThrow();
  });
});

describe('seedStaging', () => {
  const appRef = useApp();

  beforeEach(() => vi.clearAllMocks());

  const seed = () => seedStaging(appRef.app.db, appRef.app.s3);

  const seedRides = async () => {
    const result = await appRef.app.db.execute<{
      id: string;
      start_time: Date;
      ride_type: string;
      max_participants: number;
      participants: number;
      route_id: string | null;
      has_path: boolean;
      has_profile: boolean;
    }>(sql`
      select r.id, r.start_time, r.ride_type, r.max_participants, r.route_id,
        (select count(*)::int from ride_participants p where p.ride_id = r.id) as participants,
        rt.path is not null as has_path,
        rt.elevation_profile is not null as has_profile
      from rides r
      join users u on u.id = r.creator_id
      left join routes rt on rt.id = r.route_id
      where u.email like '%@seed.loopra.cc'
    `);

    return result.rows.map((row) => ({ ...row, start_time: new Date(row.start_time) }));
  };

  const future = (list: Awaited<ReturnType<typeof seedRides>>) =>
    list.filter((ride) => ride.start_time > new Date());

  const countUsers = async () => {
    const result = await appRef.app.db.execute<{ count: number }>(
      sql`select count(*)::int as count from users where email like '%@seed.loopra.cc'`,
    );
    return result.rows[0].count;
  };

  it('creates the organisers and the future Rides with routes on an empty database', async () => {
    const before = Date.now();

    const result = await seed();

    const list = await seedRides();
    expect(result).toEqual({ organisersCreated: 10, ridesCreated: STAGING_SEED_FUTURE_RIDES });
    expect(await countUsers()).toBe(10);
    expect(list).toHaveLength(STAGING_SEED_FUTURE_RIDES);
    for (const ride of list) {
      expect(ride.route_id).not.toBeNull();
      expect(ride.has_path).toBe(true);
      expect(ride.has_profile).toBe(true);
      expect(ride.start_time.getTime()).toBeGreaterThanOrEqual(before + MIN_LEAD_HOURS * HOUR);
      expect(ride.start_time.getTime()).toBeLessThanOrEqual(before + 21 * DAY);
    }
    expect(uploadToS3).toHaveBeenCalled();
  });

  it('marks the organisers verified', async () => {
    await seed();

    const result = await appRef.app.db.execute<{ unverified: number }>(
      sql`select count(*)::int as unverified from users
        where email like '%@seed.loopra.cc' and not email_verified`,
    );
    expect(result.rows[0].unverified).toBe(0);
  });

  it('creates nothing on a second run straight after', async () => {
    await seed();
    vi.clearAllMocks();

    const result = await seed();

    expect(result).toEqual({ organisersCreated: 0, ridesCreated: 0 });
    expect(await countUsers()).toBe(10);
    expect(await seedRides()).toHaveLength(STAGING_SEED_FUTURE_RIDES);
    expect(uploadToS3).not.toHaveBeenCalled();
  });

  it('tops up after some Rides are in the past and keeps the past ones', async () => {
    await seed();
    await appRef.app.db.execute(sql`
      update rides set start_time = now() - interval '1 day'
      where id in (select id from rides order by start_time limit 3)
    `);

    const result = await seed();

    const list = await seedRides();
    expect(result).toEqual({ organisersCreated: 0, ridesCreated: 3 });
    expect(list).toHaveLength(STAGING_SEED_FUTURE_RIDES + 3);
    expect(future(list)).toHaveLength(STAGING_SEED_FUTURE_RIDES);
  });

  it('places topped-up Rides after the latest future one', async () => {
    await seed();
    const latest = Math.max(...(await seedRides()).map((ride) => ride.start_time.getTime()));
    await appRef.app.db.execute(sql`
      update rides set start_time = now() - interval '1 day'
      where id in (select id from rides order by start_time limit 1)
    `);

    await seed();

    const newest = Math.max(...(await seedRides()).map((ride) => ride.start_time.getTime()));
    expect(newest).toBeGreaterThan(latest);
    expect(newest).toBeGreaterThanOrEqual(Date.now() + MIN_LEAD_HOURS * HOUR);
    expect(newest).toBeLessThanOrEqual(Date.now() + 23 * DAY);
  });

  it('gives full Rides, Rides with a few riders, empty Rides and a mix of types', async () => {
    await seed();

    const list = await seedRides();
    const full = list.filter((ride) => ride.participants === ride.max_participants);
    const few = list.filter(
      (ride) => ride.participants > 1 && ride.participants < ride.max_participants,
    );
    const empty = list.filter((ride) => ride.participants === 1);
    expect(full.length).toBeGreaterThanOrEqual(2);
    expect(few.length).toBeGreaterThanOrEqual(2);
    expect(empty.length).toBeGreaterThanOrEqual(2);
    expect(new Set(list.map((ride) => ride.ride_type))).toEqual(new Set(RIDE_TYPES));
  });

  it('ignores Rides of other users and keeps them', async () => {
    const { userId } = await registerUser(appRef.app, 'dev@loopra.test');
    await appRef.app.db.insert(rides).values(newRide({ user_id: userId }));

    const result = await seed();

    expect(result.ridesCreated).toBe(STAGING_SEED_FUTURE_RIDES);
    const others = await appRef.app.db.execute<{ count: number }>(
      sql`select count(*)::int as count from rides where creator_id = ${userId}`,
    );
    expect(others.rows[0].count).toBe(1);
  });
});
