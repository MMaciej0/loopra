import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { users } from '../../../db/schema.js';
import { createTokenFamily } from './tokenFamily.js';

import type { Redis } from 'ioredis';
import type { Db } from '../../../db/index.js';
import { UserNotFoundError, InvalidPasswordError, OAuthOnlyAccountError } from '../errors.js';

export const loginUser = async (database: Db, redis: Redis, email: string, password: string) => {
  const [user] = await database.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    throw new UserNotFoundError();
  }

  if (!user.password_hash) {
    throw new OAuthOnlyAccountError();
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
