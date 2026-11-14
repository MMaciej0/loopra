import type { FastifyRequest } from 'fastify';
import type { Redis } from 'ioredis';
import { upsertRateLimit } from '../../../utils/rateLimit.js';

const FEEDBACK_OPTIONS = {
  maxAttempts: 30,
  timeout: 60 * 60,
};

export const helpFeedbackRateLimiter = async (request: FastifyRequest, redis: Redis) => {
  await upsertRateLimit(redis, `rate-limit:help-feedback-ip:${request.ip}`, FEEDBACK_OPTIONS);
};
