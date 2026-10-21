import { Redis } from 'ioredis';
import { Resend } from 'resend';
import { eq } from 'drizzle-orm';
import { APP_URL } from '../../../config/env.js';
import { Db } from '../../../db/index.js';
import { users } from '../../../db/schema.js';
import { UserNotFoundError } from '../errors.js';
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

  if (user.is_guest) {
    return;
  }

  if (!user.password_hash) {
    await resend.emails.send({
      from: 'Loopra <noreply@loopra.cc>',
      to: email,
      subject: 'Your Loopra account uses Google sign-in',
      html: `
        <p>You asked to reset your Loopra password.</p>
        <p>Your account has no password. You sign in with Google.</p>
        <p><a href="${APP_URL}/login">Log in to Loopra</a></p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });
    return;
  }

  const { rawToken } = await createPasswordResetToken(redis, user.id);
  const resetLink = `${APP_URL}/reset-password?token=${rawToken}`;

  await resend.emails.send({
    from: 'Loopra <noreply@loopra.cc>',
    to: email,
    subject: 'Reset your Loopra password',
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetLink}">Reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `,
  });
};
