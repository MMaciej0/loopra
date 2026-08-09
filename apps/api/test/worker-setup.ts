import { Pool } from 'pg';
import { Redis } from 'ioredis';
import { beforeAll, beforeEach, afterAll } from 'vitest';
import { withDatabase, workerDbName } from './helpers/databases.js';

const workerId = Number(process.env.VITEST_POOL_ID ?? 1);

process.env.DATABASE_URL = withDatabase(process.env.DATABASE_URL!, workerDbName(workerId));
process.env.REDIS_URL = withDatabase(process.env.REDIS_URL!, String(workerId % 16));

let pool: Pool;
let redis: Redis;

beforeAll(() => {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  redis = new Redis(process.env.REDIS_URL!);
});

beforeEach(async () => {
  await pool.query('TRUNCATE TABLE users CASCADE');
  await redis.flushdb();
});

afterAll(async () => {
  await pool.end();
  await redis.quit();
});
