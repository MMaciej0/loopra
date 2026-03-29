import { createHash, randomBytes, randomUUID } from 'crypto';
import type { Redis } from 'ioredis';

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
