import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { users } from '../../../db/schema.js';
import { rotateTokenFamily } from './tokenFamily.js';

interface RefreshSessionParams {
  fastify: FastifyInstance;
  familyUuid: string;
  rawRefreshToken: string;
}

export const refreshSession = async ({ fastify, familyUuid, rawRefreshToken }: RefreshSessionParams) => {
  const { newRawRefreshToken, userId } = await rotateTokenFamily(fastify.redis, familyUuid, rawRefreshToken);

  const [user] = await fastify.db
    .select({ email_verified: users.email_verified })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const accessToken = fastify.jwt.sign({ sub: userId, email_verified: user?.email_verified ?? false });

  return { accessToken, newRawRefreshToken, userId };
};
