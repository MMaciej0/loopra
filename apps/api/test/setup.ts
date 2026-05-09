import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Redis } from 'ioredis';
import { beforeAll, beforeEach, afterAll } from 'vitest';
import * as schema from '../src/db/schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Must run before any app module is imported so config/env.ts reads the correct values
config({ path: resolve(__dirname, '../.env.test'), override: true });

let pool: Pool;
let redis: Redis;

beforeAll(async () => {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  await pool.query('CREATE EXTENSION IF NOT EXISTS postgis');
  await migrate(db, { migrationsFolder: resolve(__dirname, '../drizzle') });

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
