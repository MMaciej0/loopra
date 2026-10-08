import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { users } from '../../../db/schema.js';
import { createTokenFamily, deleteAllFamilies } from './tokenFamily.js';
import { InvalidPasswordError, OAuthOnlyAccountError, UserNotFoundError } from '../errors.js';

interface ChangePasswordParams {
  fastify: FastifyInstance;
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async ({
  fastify,
  userId,
  currentPassword,
  newPassword,
}: ChangePasswordParams) => {
  const [user] = await fastify.db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) {
    throw new UserNotFoundError();
  }

  if (!user.password_hash) {
    throw new OAuthOnlyAccountError();
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

  if (!isPasswordValid) {
    throw new InvalidPasswordError();
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await fastify.db.update(users).set({ password_hash: passwordHash }).where(eq(users.id, userId));

  await deleteAllFamilies(fastify.redis, userId);

  const { familyUuid, rawRefreshToken } = await createTokenFamily(fastify.redis, userId);
  const accessToken = fastify.jwt.sign({ sub: userId, email_verified: user.email_verified });

  return { accessToken, rawRefreshToken, familyUuid };
};
