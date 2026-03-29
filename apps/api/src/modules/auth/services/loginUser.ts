import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { users } from '../../../db/schema.js';
import { createTokenFamily } from './createTokenFamily.js';

import type { Redis } from 'ioredis';
import type { Db } from '../../../db/index.js';

export class UserNotFoundError extends Error {}
export class InvalidPasswordError extends Error {}

export const loginUser = async (database: Db, redis: Redis, email: string, password: string) => {
  const [user] = await database.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    throw new UserNotFoundError();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new InvalidPasswordError();
  }

  const { familyUuid, rawRefreshToken } = await createTokenFamily(redis, user.id);

  return {
    user,
    rawRefreshToken,
    familyUuid,
  };
};
