import { Redis } from 'ioredis';
import { Db } from '../../../db/index.js';
import { Resend } from 'resend';
import { users } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { createEmailVerificationToken } from './emailVerificationToken.js';
import { APP_URL } from '../../../config/env.js';

export const sendEmailVerification = async (
  email: string,
  database: Db,
  redis: Redis,
  resend: Resend,
) => {
  const [user] = await database.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    return; // silent — don't leak whether email exists
  }

  if (user.is_guest) {
    return;
  }

  if (user.email_verified) {
    return; // silent — don't leak whether email exists
  }

  const { rawToken } = await createEmailVerificationToken(redis, user.email);
  const verificationLink = `${APP_URL}/verify-email?token=${rawToken}`;

  await resend.emails.send({
    from: 'Loopra <noreply@loopra.cc>',
    to: email,
    subject: 'Verify your Loopra email',
    html: `
      <p>You requested to verify your email.</p>
      <p><a href="${verificationLink}">Verify your email</a></p>
      <p>This link expires in 24 hours. If you didn't request this, ignore this email.</p>
    `,
  });
};
