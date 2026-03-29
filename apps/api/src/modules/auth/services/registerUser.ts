import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { users } from '../../../db/schema.js';
import { createTokenFamily } from './createTokenFamily.js';

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

  const { familyUuid, rawRefreshToken } = await createTokenFamily(redis, user.id);

  return {
    user,
    rawRefreshToken,
    familyUuid,
  };
};
