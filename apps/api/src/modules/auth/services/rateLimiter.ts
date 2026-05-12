import { FastifyRequest } from 'fastify';
import { Redis } from 'ioredis';
import { AppError, ErrorType } from '../../../utils/errors.js';

const upsertRateLimit = async (redis: Redis, key: string) => {
  const value = await redis.get(key);

  if (value) {
    if (Number(value) >= 5) {
      throw new AppError(429, ErrorType.RATE_LIMIT_EXCEEDED, 'Rate limit exceeded');
    } else {
      await redis.incr(key);
    }
  } else {
    await redis.set(key, 1, 'EX', 15 * 60);
  }
};

const createIpKey = (ip: string) => `rate-limit:ip:${ip}`;
const createEmailKey = (email: string) => `rate-limit:email:${email}`;

export const rateLimiter = async (request: FastifyRequest, redis: Redis, email?: string) => {
  const { ip } = request;
  const ipKey = createIpKey(ip);
  await upsertRateLimit(redis, ipKey);

  if (!email) {
    return;
  }

  const emailKey = createEmailKey(email);
  await upsertRateLimit(redis, emailKey);
};

export const clearRateLimits = async (request: FastifyRequest, redis: Redis, email?: string) => {
  const { ip } = request;
  await redis.del(createIpKey(ip));
  if (email) {
    await redis.del(createEmailKey(email));
  }
};
