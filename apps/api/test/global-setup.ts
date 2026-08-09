import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { TEMPLATE_DB, TEST_WORKERS, withDatabase, workerDbName } from './helpers/databases.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const baseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return url;
};

// CREATE/DROP DATABASE cannot run while connected to the target database.
const adminPool = () => new Pool({ connectionString: withDatabase(baseUrl(), 'postgres') });

const dropTestDatabases = async (admin: Pool) => {
  const { rows } = await admin.query<{ datname: string }>(
    'SELECT datname FROM pg_database WHERE datname LIKE $1 OR datname = $2',
    ['loopra_test_w%', TEMPLATE_DB],
  );

  for (const { datname } of rows) {
    await admin.query(`DROP DATABASE IF EXISTS "${datname}" WITH (FORCE)`);
  }
};

export async function setup() {
  const admin = adminPool();

  // a previous run may have crashed before teardown
  await dropTestDatabases(admin);
  await admin.query(`CREATE DATABASE "${TEMPLATE_DB}"`);

  // migration 0000 creates the postgis extension, so a bare database is enough here
  const templatePool = new Pool({ connectionString: withDatabase(baseUrl(), TEMPLATE_DB) });
  await migrate(drizzle(templatePool), { migrationsFolder: resolve(__dirname, '../drizzle') });

  // Postgres refuses to clone a template that has an open session, so this must
  // close before the CREATE ... TEMPLATE calls below.
  await templatePool.end();

  for (let id = 1; id <= TEST_WORKERS; id++) {
    await admin.query(`CREATE DATABASE "${workerDbName(id)}" TEMPLATE "${TEMPLATE_DB}"`);
  }

  await admin.end();
}

export async function teardown() {
  const admin = adminPool();
  await dropTestDatabases(admin);
  await admin.end();
}
