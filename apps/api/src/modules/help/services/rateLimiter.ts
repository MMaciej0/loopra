import type { FastifyRequest } from 'fastify';
import type { Redis } from 'ioredis';
import { upsertRateLimit } from '../../../utils/rateLimit.js';
import { RateLimitExceededError } from '../../../utils/errors.js';
import { HelpUnavailableError } from '../errors.js';

const FEEDBACK_OPTIONS = {
  maxAttempts: 30,
  timeout: 60 * 60,
};

const ASK_IP_MINUTE_OPTIONS = {
  maxAttempts: 6,
  timeout: 60,
};

const ASK_IP_HOUR_OPTIONS = {
  maxAttempts: 30,
  timeout: 60 * 60,
};

const ASK_GLOBAL_DAY_OPTIONS = {
  maxAttempts: 3000,
  timeout: 60 * 60 * 24,
};

export const helpFeedbackRateLimiter = async (request: FastifyRequest, redis: Redis) => {
  await upsertRateLimit(redis, `rate-limit:help-feedback-ip:${request.ip}`, FEEDBACK_OPTIONS);
};

export const helpAskRateLimiter = async (request: FastifyRequest, redis: Redis) => {
  await upsertRateLimit(
    redis,
    `rate-limit:help-ask-ip-minute:${request.ip}`,
    ASK_IP_MINUTE_OPTIONS,
  );
  await upsertRateLimit(redis, `rate-limit:help-ask-ip-hour:${request.ip}`, ASK_IP_HOUR_OPTIONS);

  try {
    await upsertRateLimit(redis, 'rate-limit:help-ask-global-day', ASK_GLOBAL_DAY_OPTIONS);
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      throw new HelpUnavailableError();
    }
    throw error;
  }
};
