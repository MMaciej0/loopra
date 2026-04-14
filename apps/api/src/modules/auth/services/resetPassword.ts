import bcrypt from 'bcrypt';
import { Redis } from 'ioredis';
import { Db } from '../../../db/index.js';
import { consumePasswordResetToken } from './passwordResetToken.js';
import { users } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { deleteAllFamilies } from './tokenFamily.js';

export const resetPassword = async (
  rawToken: string,
  newPassword: string,
  database: Db,
  redis: Redis,
) => {
  const { userId } = await consumePasswordResetToken(redis, rawToken);

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await database.update(users).set({ password_hash: passwordHash }).where(eq(users.id, userId));

  await deleteAllFamilies(redis, userId);
};
