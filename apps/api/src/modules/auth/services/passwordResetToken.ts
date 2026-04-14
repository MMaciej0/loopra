import { Redis } from 'ioredis';
import { createHash, randomBytes } from 'node:crypto';

export class InvalidResetTokenError extends Error {}

const TTL_SECONDS = 60 * 60; // 1 hour
const KEY = (token: string) => `password-reset:${token}`;

export const createPasswordResetToken = async (redis: Redis, userId: string) => {
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');

  await redis.set(KEY(tokenHash), userId, 'EX', TTL_SECONDS);

  return {
    rawToken,
  };
};

export const consumePasswordResetToken = async (redis: Redis, rawToken: string) => {
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');
  const userId = await redis.get(KEY(tokenHash));

  if (!userId) throw new InvalidResetTokenError();

  await redis.del(KEY(tokenHash));

  return { userId };
};
