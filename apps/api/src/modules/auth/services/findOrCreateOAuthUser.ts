import { and, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { DEFAULT_FAVORITE_LOCATION } from '@loopra/domain';
import { oauth_accounts, users } from '../../../db/schema.js';
import { createTokenFamily } from './tokenFamily.js';

interface FindOrCreateOAuthUserParams {
  fastify: FastifyInstance;
  provider: string;
  providerUserId: string;
  email: string;
}

export const findOrCreateOAuthUser = async ({
  fastify,
  provider,
  providerUserId,
  email,
}: FindOrCreateOAuthUserParams) => {
  // Case 1 — returning OAuth user
  const [oauthAccount] = await fastify.db
    .select({ user_id: oauth_accounts.user_id, email_verified: users.email_verified })
    .from(oauth_accounts)
    .innerJoin(users, eq(oauth_accounts.user_id, users.id))
    .where(
      and(
        eq(oauth_accounts.provider, provider),
        eq(oauth_accounts.provider_user_id, providerUserId),
      ),
    )
    .limit(1);

  if (oauthAccount) {
    const { familyUuid, rawRefreshToken } = await createTokenFamily(
      fastify.redis,
      oauthAccount.user_id,
    );
    const accessToken = fastify.jwt.sign({
      sub: oauthAccount.user_id,
      email_verified: oauthAccount.email_verified,
    });
    return { userId: oauthAccount.user_id, accessToken, familyUuid, rawRefreshToken };
  }

  // Case 2 — existing email user, first OAuth login: link the account and mark verified
  const [existingUser] = await fastify.db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    await fastify.db.insert(oauth_accounts).values({
      user_id: existingUser.id,
      provider,
      provider_user_id: providerUserId,
    });

    await fastify.db
      .update(users)
      .set({ email_verified: true, email_verified_at: new Date() })
      .where(eq(users.id, existingUser.id));

    const { familyUuid, rawRefreshToken } = await createTokenFamily(fastify.redis, existingUser.id);
    const accessToken = fastify.jwt.sign({ sub: existingUser.id, email_verified: true });
    return { userId: existingUser.id, accessToken, familyUuid, rawRefreshToken };
  }

  // Case 3 — brand new user: Google already verified the email
  const [newUser] = await fastify.db
    .insert(users)
    .values({
      email,
      password_hash: null,
      email_verified: true,
      email_verified_at: new Date(),
      ...DEFAULT_FAVORITE_LOCATION,
    })
    .returning();

  await fastify.db.insert(oauth_accounts).values({
    user_id: newUser.id,
    provider,
    provider_user_id: providerUserId,
  });

  const { familyUuid, rawRefreshToken } = await createTokenFamily(fastify.redis, newUser.id);
  const accessToken = fastify.jwt.sign({ sub: newUser.id, email_verified: true });
  return { userId: newUser.id, accessToken, familyUuid, rawRefreshToken };
};
