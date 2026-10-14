import { createHash, randomBytes, randomUUID } from 'crypto';
import type { Redis } from 'ioredis';
import { InvalidTokenError } from '../errors.js';

const FAMILY_TTL_SECONDS = 2592000;
const REUSE_WINDOW_SECONDS = 10;

type RotationStatus = 'missing' | 'rotated' | 'reused' | 'theft';

const ROTATE_SCRIPT = `
local familyData = redis.call('GET', KEYS[1])

if not familyData then
  return { 'missing' }
end

local family = cjson.decode(familyData)

if family.refreshTokenHash == ARGV[1] then
  redis.call('SET', KEYS[2], ARGV[1], 'EX', ARGV[4])
  family.refreshTokenHash = ARGV[2]
  redis.call('SET', KEYS[1], cjson.encode(family), 'EX', ARGV[3])
  return { 'rotated', family.userId }
end

if redis.call('GET', KEYS[2]) == ARGV[1] then
  return { 'reused', family.userId }
end

return { 'theft', family.userId }
`;

export const replacedTokenKey = (familyUuid: string) => `family:${familyUuid}:replaced`;

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

  await redis.del(`family:${familyUuid}`, replacedTokenKey(familyUuid));
  await redis.srem(`user:families:${userId}`, familyUuid);
};

export const rotateTokenFamily = async (redis: Redis, familyUuid: string, rawToken: string) => {
  if (!rawToken) {
    throw new InvalidTokenError();
  }

  const incomingTokenHash = createHash('sha256').update(rawToken).digest('hex');
  const newRawRefreshToken = randomBytes(32).toString('hex');
  const newTokenHash = createHash('sha256').update(newRawRefreshToken).digest('hex');

  const [status, userId] = (await redis.eval(
    ROTATE_SCRIPT,
    2,
    `family:${familyUuid}`,
    replacedTokenKey(familyUuid),
    incomingTokenHash,
    newTokenHash,
    FAMILY_TTL_SECONDS,
    REUSE_WINDOW_SECONDS,
  )) as [RotationStatus, string];

  if (status === 'missing') {
    throw new InvalidTokenError();
  }

  if (status === 'theft') {
    await deleteAllFamilies(redis, userId);
    throw new InvalidTokenError();
  }

  return {
    newRawRefreshToken: status === 'rotated' ? newRawRefreshToken : null,
    userId,
  };
};

const upsertFamilies = async (redis: Redis, familyUuid: string, userId: string) => {
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');

  await redis.set(
    `family:${familyUuid}`,
    JSON.stringify({ userId, refreshTokenHash: tokenHash }),
    'EX',
    FAMILY_TTL_SECONDS,
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
    await redis.del(
      ...familyUuids.map((uuid) => `family:${uuid}`),
      ...familyUuids.map((uuid) => replacedTokenKey(uuid)),
    );
  }

  await redis.del(`user:families:${userId}`);
};
