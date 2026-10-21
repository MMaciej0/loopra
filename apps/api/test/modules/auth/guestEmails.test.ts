import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { users } from '../../../src/db/schema.js';

const GUEST_EMAIL = 'guest-0123456789abcdef@guest.loopra.cc';

describe('emails to a guest', () => {
  const appRef = useApp();

  const sendMock = () =>
    vi
      .spyOn(appRef.app.mailer.emails, 'send')
      .mockResolvedValue({ data: { id: 'email-id' }, error: null, headers: null });

  const insertGuest = (values: Partial<typeof users.$inferInsert> = {}) =>
    appRef.app.db.insert(users).values({
      email: GUEST_EMAIL,
      username: 'guest-0a1b',
      email_verified: true,
      email_verified_at: new Date(),
      is_guest: true,
      ...values,
    });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /auth/forgot-password', () => {
    const forgotPassword = (email: string) =>
      appRef.app.inject({ method: 'POST', url: '/auth/forgot-password', body: { email } });

    it('sends nothing and creates no reset token', async () => {
      await insertGuest();
      const send = sendMock();

      const response = await forgotPassword(GUEST_EMAIL);

      expect(response.statusCode).toBe(200);
      expect(send).not.toHaveBeenCalled();
      expect(await appRef.app.redis.keys('password-reset:*')).toHaveLength(0);
    });

    it('answers the same as for an unknown email and for a rider who is not a guest', async () => {
      await insertGuest();
      await appRef.app.db.insert(users).values({ email: 'google@example.com' });
      sendMock();

      const guestResponse = await forgotPassword(GUEST_EMAIL);
      const unknownResponse = await forgotPassword('unknown@example.com');
      const riderResponse = await forgotPassword('google@example.com');

      expect(guestResponse.statusCode).toBe(200);
      expect(unknownResponse.statusCode).toBe(guestResponse.statusCode);
      expect(unknownResponse.body).toBe(guestResponse.body);
      expect(riderResponse.statusCode).toBe(guestResponse.statusCode);
      expect(riderResponse.body).toBe(guestResponse.body);
    });

    it('still sends to a rider who is not a guest', async () => {
      await appRef.app.db.insert(users).values({ email: 'google@example.com' });
      const send = sendMock();

      await forgotPassword('google@example.com');

      expect(send).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /auth/resend-verification-email', () => {
    const resendVerification = (email: string) =>
      appRef.app.inject({
        method: 'POST',
        url: '/auth/resend-verification-email',
        body: { email },
      });

    it('sends nothing to a guest', async () => {
      await insertGuest();
      const send = sendMock();

      const response = await resendVerification(GUEST_EMAIL);

      expect(response.statusCode).toBe(200);
      expect(send).not.toHaveBeenCalled();
    });

    it('sends nothing to a guest whose email is not verified', async () => {
      await insertGuest({ email_verified: false, email_verified_at: null });
      const send = sendMock();

      const response = await resendVerification(GUEST_EMAIL);

      expect(response.statusCode).toBe(200);
      expect(send).not.toHaveBeenCalled();
      expect(await appRef.app.redis.keys('email-verification:*')).toHaveLength(0);
    });

    it('still sends to an unverified rider who is not a guest', async () => {
      await appRef.app.db.insert(users).values({ email: 'unverified@example.com' });
      const send = sendMock();

      await resendVerification('unverified@example.com');

      expect(send).toHaveBeenCalledTimes(1);
    });
  });
});
