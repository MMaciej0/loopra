import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const migrationsFolder = resolve(dirname(fileURLToPath(import.meta.url)), '../drizzle');

const pool = new Pool({ connectionString: DATABASE_URL });

try {
  await migrate(drizzle(pool), { migrationsFolder });
  console.log('Migrations applied');
} catch (error) {
  console.error('Migration failed', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
