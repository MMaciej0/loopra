import { FastifyRequest } from 'fastify';
import { Redis } from 'ioredis';
import { RateLimitExceededError } from '../errors.js';

interface Options {
  maxAttempts: number;
  timeout: number;
}

const upsertRateLimit = async (redis: Redis, key: string, options: Options) => {
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

const createIpKey = (ip: string) => `rate-limit:ip:${ip}`;
const createEmailKey = (email: string) => `rate-limit:email:${email}`;
const createEmailSendAddressKey = (email: string) => `rate-limit:email-send-address:${email}`;
const createEmailSendIpKey = (ip: string) => `rate-limit:email-send-ip:${ip}`;
const createPasswordChangeKey = (userId: string) => `rate-limit:password-change:${userId}`;

const AUTH_OPTIONS = {
  maxAttempts: 5,
  timeout: 15 * 60, // 15 mins
};

const EMAIL_SEND_OPTIONS = {
  maxAttempts: 3,
  timeout: 60 * 60, // 60 mins
};

export const authRateLimiter = async (request: FastifyRequest, redis: Redis, email?: string) => {
  const { ip } = request;
  const ipKey = createIpKey(ip);
  await upsertRateLimit(redis, ipKey, AUTH_OPTIONS);

  if (!email) {
    return;
  }

  const emailKey = createEmailKey(email);
  await upsertRateLimit(redis, emailKey, AUTH_OPTIONS);
};

export const emailSendRateLimiter = async (
  request: FastifyRequest,
  redis: Redis,
  email: string,
) => {
  const emailSendIpKey = createEmailSendIpKey(request.ip);
  const emailSendKey = createEmailSendAddressKey(email);
  await upsertRateLimit(redis, emailSendIpKey, EMAIL_SEND_OPTIONS);
  await upsertRateLimit(redis, emailSendKey, EMAIL_SEND_OPTIONS);
};

export const clearRateLimits = async (request: FastifyRequest, redis: Redis, email?: string) => {
  const { ip } = request;
  await redis.del(createIpKey(ip));
  if (email) {
    await redis.del(createEmailKey(email));
  }
};

export const passwordChangeRateLimiter = async (redis: Redis, userId: string) => {
  await upsertRateLimit(redis, createPasswordChangeKey(userId), AUTH_OPTIONS);
};

export const clearPasswordChangeRateLimit = async (redis: Redis, userId: string) => {
  await redis.del(createPasswordChangeKey(userId));
};
