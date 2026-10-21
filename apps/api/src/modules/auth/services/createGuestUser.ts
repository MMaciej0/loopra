import { randomBytes, randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { users } from '../../../db/schema.js';
import { createTokenFamily } from './tokenFamily.js';

export const createGuestUser = async (fastify: FastifyInstance) => {
  const [user] = await fastify.db
    .insert(users)
    .values({
      email: `guest-${randomUUID().replaceAll('-', '')}@guest.loopra.cc`,
      username: `guest-${randomBytes(2).toString('hex')}`,
      password_hash: null,
      email_verified: true,
      email_verified_at: new Date(),
      is_guest: true,
    })
    .returning();

  const { familyUuid, rawRefreshToken } = await createTokenFamily(fastify.redis, user.id);
  const accessToken = fastify.jwt.sign({ sub: user.id, email_verified: true });

  return { user, accessToken, rawRefreshToken, familyUuid };
};
