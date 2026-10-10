import { and, eq, TransactionRollbackError } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { oauth_accounts, users } from '../../../db/schema.js';
import { createTokenFamily, deleteAllFamilies } from './tokenFamily.js';

interface FindOrCreateOAuthUserParams {
  fastify: FastifyInstance;
  provider: string;
  providerUserId: string;
  email: string;
}

const MAX_ATTEMPTS = 3;

const attemptFindOrCreate = async ({
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
    return { userId: oauthAccount.user_id, emailVerified: oauthAccount.email_verified };
  }

  // Case 2 — existing verified email user, first OAuth login: link the account
  const [existingUser] = await fastify.db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser?.email_verified) {
    const [linked] = await fastify.db
      .insert(oauth_accounts)
      .values({ user_id: existingUser.id, provider, provider_user_id: providerUserId })
      .onConflictDoNothing({ target: [oauth_accounts.provider, oauth_accounts.provider_user_id] })
      .returning({ id: oauth_accounts.id });

    return linked ? { userId: existingUser.id, emailVerified: true } : null;
  }

  // An unverified account is disposable (docs/adr/0002): delete it and fall through to Case 3
  if (existingUser) {
    await deleteAllFamilies(fastify.redis, existingUser.id);
    await fastify.db.delete(users).where(eq(users.id, existingUser.id));
  }

  // Case 3 — new user: Google already verified the email
  try {
    return await fastify.db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({
          email,
          password_hash: null,
          email_verified: true,
          email_verified_at: new Date(),
        })
        .onConflictDoNothing({ target: users.email })
        .returning();

      if (!newUser) {
        return null;
      }

      const [linked] = await tx
        .insert(oauth_accounts)
        .values({ user_id: newUser.id, provider, provider_user_id: providerUserId })
        .onConflictDoNothing({ target: [oauth_accounts.provider, oauth_accounts.provider_user_id] })
        .returning({ id: oauth_accounts.id });

      if (!linked) {
        tx.rollback();
      }

      return { userId: newUser.id, emailVerified: true };
    });
  } catch (error) {
    if (error instanceof TransactionRollbackError) {
      return null;
    }
    throw error;
  }
};

export const findOrCreateOAuthUser = async (params: FindOrCreateOAuthUserParams) => {
  const { fastify } = params;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const found = await attemptFindOrCreate(params);

    if (found) {
      const { familyUuid, rawRefreshToken } = await createTokenFamily(fastify.redis, found.userId);
      const accessToken = fastify.jwt.sign({
        sub: found.userId,
        email_verified: found.emailVerified,
      });
      return { userId: found.userId, accessToken, familyUuid, rawRefreshToken };
    }
  }

  throw new Error(`OAuth login lost the race ${MAX_ATTEMPTS} times in a row`);
};
