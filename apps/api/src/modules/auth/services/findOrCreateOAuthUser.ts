import { and, eq } from 'drizzle-orm';
import { oauth_accounts, users } from '../../../db/schema.js';
import { createTokenFamily } from './tokenFamily.js';

import type { Redis } from 'ioredis';
import type { Db } from '../../../db/index.js';

export const findOrCreateOAuthUser = async (
  db: Db,
  redis: Redis,
  provider: string,
  providerUserId: string,
  email: string,
) => {
  // Case 1 — returning OAuth user
  const [oauthAccount] = await db
    .select()
    .from(oauth_accounts)
    .where(and(eq(oauth_accounts.provider, provider), eq(oauth_accounts.provider_user_id, providerUserId)))
    .limit(1);

  if (oauthAccount) {
    const { familyUuid, rawRefreshToken } = await createTokenFamily(redis, oauthAccount.user_id);
    return { userId: oauthAccount.user_id, email, familyUuid, rawRefreshToken };
  }

  // Case 2 — existing email user, first OAuth login: link the account and mark verified
  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingUser) {
    await db.insert(oauth_accounts).values({
      user_id: existingUser.id,
      provider,
      provider_user_id: providerUserId,
    });

    await db
      .update(users)
      .set({ email_verified: true, email_verified_at: new Date() })
      .where(eq(users.id, existingUser.id));

    const { familyUuid, rawRefreshToken } = await createTokenFamily(redis, existingUser.id);
    return { userId: existingUser.id, email, familyUuid, rawRefreshToken };
  }

  // Case 3 — brand new user: Google already verified the email
  const [newUser] = await db
    .insert(users)
    .values({ email, password_hash: null, email_verified: true, email_verified_at: new Date() })
    .returning();

  await db.insert(oauth_accounts).values({
    user_id: newUser.id,
    provider,
    provider_user_id: providerUserId,
  });

  const { familyUuid, rawRefreshToken } = await createTokenFamily(redis, newUser.id);
  return { userId: newUser.id, email, familyUuid, rawRefreshToken };
};
