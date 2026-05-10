import { createHash, randomBytes, randomUUID } from 'crypto';
import type { Redis } from 'ioredis';
import { InvalidTokenError } from '../errors.js';

export const createTokenFamily = async (redis: Redis, userId: string) => {
  const familyUuid = randomUUID();

  const { rawRefreshToken } = await upsertFamilies(redis, familyUuid, userId);

  return {
    familyUuid,
    rawRefreshToken,
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

export const rotateTokenFamily = async (redis: Redis, familyUuid: string, rawToken: string) => {
  const familyData = await redis.get(`family:${familyUuid}`);

  if (!familyData) {
    throw new InvalidTokenError();
  }

  const { refreshTokenHash, userId } = JSON.parse(familyData);
  const incomingTokenHash = createHash('sha256').update(rawToken).digest('hex');

  if (refreshTokenHash !== incomingTokenHash) {
    await deleteAllFamilies(redis, userId);
    throw new InvalidTokenError();
  }

  const { rawRefreshToken } = await upsertFamilies(redis, familyUuid, userId);

  return {
    newRawRefreshToken: rawRefreshToken,
    userId: userId,
  };
};

const upsertFamilies = async (redis: Redis, familyUuid: string, userId: string) => {
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

export const deleteAllFamilies = async (redis: Redis, userId: string) => {
  const familyUuids = await redis.smembers(`user:families:${userId}`);

  if (familyUuids.length > 0) {
    await redis.del(...familyUuids.map((uuid) => `family:${uuid}`));
  }

  await redis.del(`user:families:${userId}`);
};
