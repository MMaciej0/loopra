import { Redis } from 'ioredis';
import { RateLimitExceededError } from './errors.js';

export interface RateLimitOptions {
  maxAttempts: number;
  timeout: number;
}

export const upsertRateLimit = async (redis: Redis, key: string, options: RateLimitOptions) => {
  const result = await redis.multi().incr(key).expire(key, options.timeout, 'NX').exec();

  if (!result) {
    throw new Error('Rate limit transaction returned no result');
  }

  const error = result[0][0] || result[1][0];

  if (error) {
    throw error;
  }

  const count = Number(result[0][1]);

  if (count > options.maxAttempts) {
    throw new RateLimitExceededError();
  }
};
