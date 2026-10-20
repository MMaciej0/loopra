import { FastifyRequest } from 'fastify';
import { Redis } from 'ioredis';
import { upsertRateLimit } from '../../../utils/rateLimit.js';

const CONTACT_OPTIONS = {
  maxAttempts: 5,
  timeout: 60 * 60,
};

export const contactRateLimiter = async (request: FastifyRequest, redis: Redis) => {
  await upsertRateLimit(redis, `rate-limit:contact-ip:${request.ip}`, CONTACT_OPTIONS);
};
