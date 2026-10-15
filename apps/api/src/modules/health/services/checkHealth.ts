import { sql } from 'drizzle-orm';
import type { Redis } from 'ioredis';
import type { Db } from '../../../db/index.js';
import type { HealthResponse, ServiceStatus } from '../schema.js';

const CHECK_TIMEOUT_MS = 1000;

const probe = async (check: () => Promise<unknown>): Promise<ServiceStatus> => {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Health check timed out')), CHECK_TIMEOUT_MS);
  });

  try {
    await Promise.race([check(), timeout]);
    return 'ok';
  } catch {
    return 'error';
  } finally {
    clearTimeout(timer);
  }
};

export const checkHealth = async (db: Db, redis: Redis): Promise<HealthResponse> => {
  const [postgresStatus, redisStatus] = await Promise.all([
    probe(() => db.execute(sql`select 1`)),
    redis.status === 'ready' ? probe(() => redis.ping()) : Promise.resolve<ServiceStatus>('error'),
  ]);

  return {
    status: postgresStatus === 'ok' && redisStatus === 'ok' ? 'ok' : 'error',
    postgres: postgresStatus,
    redis: redisStatus,
  };
};
