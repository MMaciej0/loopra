import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { users } from '../../../db/schema.js';
import { createTokenFamily } from './tokenFamily.js';

import type { Redis } from 'ioredis';
import type { Db } from '../../../db/index.js';
import { UserAlreadyExistsError, OAuthOnlyAccountError } from '../errors.js';

export const registerUser = async (database: Db, redis: Redis, email: string, password: string) => {
  const [existingUser] = await database.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingUser) {
    if (!existingUser.password_hash) {
      throw new OAuthOnlyAccountError();
    }
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

  const { familyUuid, rawRefreshToken } = await createTokenFamily(redis, user.id);

  return {
    user,
    rawRefreshToken,
    familyUuid,
  };
};
