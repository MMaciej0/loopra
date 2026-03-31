import { createHash, randomBytes, randomUUID } from 'crypto';
import type { Redis } from 'ioredis';

export class InvalidTokenError extends Error {}

export const createTokenFamily = async (redis: Redis, userId: string) => {
  const familyUuid = randomUUID();
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');

  await redis.set(
    `family:${familyUuid}`,
    JSON.stringify({ userId, refreshTokenHash: tokenHash }),
    'EX',
    2592000,
  );
  await redis.sadd(`user:families:${userId}`, familyUuid);

  return {
    familyUuid,
    rawRefreshToken: rawToken,
  };
};

export const deleteTokenFamily = async (redis: Redis, familyUuid: string) => {
  const familyData = await redis.get(`family:${familyUuid}`);

  if (!familyData) {
    throw new InvalidTokenError();
  }

  const { userId } = JSON.parse(familyData);

  await redis.del(`family:${familyUuid}`);
  await redis.srem(`user:families:${userId}`, familyUuid);
};
