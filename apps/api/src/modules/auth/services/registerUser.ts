import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { users } from '../../../db/schema.js';

import type { Redis } from 'ioredis';
import type { Db } from '../../../db/index.js';

export class UserAlreadyExistsError extends Error {}

export const registerUser = async (database: Db, redis: Redis, email: string, password: string) => {
  const existingUser = await database.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingUser.length > 0) {
    throw new UserAlreadyExistsError();
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await database
    .insert(users)
    .values({
      email,
      password_hash: passwordHash,
    })
    .returning();

  const tokenFamilyUuid = randomUUID();
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');

  await redis.set(
    `family:${tokenFamilyUuid}`,
    JSON.stringify({ userId: user.id, refreshTokenHash: tokenHash }),
    'EX',
    2592000,
  );
  await redis.sadd(`user:families:${user.id}`, tokenFamilyUuid);

  return {
    user,
    rawRefreshToken: rawToken,
    familyUuid: tokenFamilyUuid,
  };
};
