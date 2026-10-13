import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DATABASE_URL } from '../config/env.js';

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool);

export type Db = typeof db;
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
