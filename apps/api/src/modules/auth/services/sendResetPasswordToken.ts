import { Redis } from 'ioredis';
import { Resend } from 'resend';
import { eq } from 'drizzle-orm';
import { APP_URL } from '../../../config/env.js';
import { Db } from '../../../db/index.js';
import { users } from '../../../db/schema.js';
import { UserNotFoundError } from './loginUser.js';
import { createPasswordResetToken } from './passwordResetToken.js';

export const sendResetPasswordToken = async (
  email: string,
  database: Db,
  redis: Redis,
  resend: Resend,
) => {
  const [user] = await database.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    throw new UserNotFoundError();
  }

  const { rawToken } = await createPasswordResetToken(redis, user.id);
  const resetLink = `${APP_URL}/reset-password?token=${rawToken}`;

  await resend.emails.send({
    from: 'Loopra <onboarding@resend.dev>',
    to: email,
    subject: 'Reset your Loopra password',
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetLink}">Reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `,
  });
};
