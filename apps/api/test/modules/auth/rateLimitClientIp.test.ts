import { describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';

describe('rate limit client ip', () => {
  const appRef = useApp();
  const RATE_LIMIT = 3;
  const UNTRUSTED_SENDER = '203.0.113.9';

  let emailCounter = 0;

  const resend = (options: { forwardedFor?: string; remoteAddress?: string }) =>
    appRef.app.inject({
      method: 'POST',
      url: '/auth/resend-verification-email',
      body: { email: `rider${emailCounter++}@example.com` },
      headers: options.forwardedFor ? { 'x-forwarded-for': options.forwardedFor } : {},
      remoteAddress: options.remoteAddress,
    });

  const ipKeys = async () => (await appRef.app.redis.keys('rate-limit:email-send-ip:*')).sort();

  it('counts each forwarded address separately when the sender is trusted', async () => {
    for (let i = 1; i <= RATE_LIMIT; i++) {
      const response = await resend({ forwardedFor: '198.51.100.1' });
      expect(response.statusCode).toBe(200);
    }

    const blocked = await resend({ forwardedFor: '198.51.100.1' });
    expect(blocked.statusCode).toBe(429);

    const other = await resend({ forwardedFor: '198.51.100.2' });
    expect(other.statusCode).toBe(200);

    expect(await ipKeys()).toEqual([
      'rate-limit:email-send-ip:198.51.100.1',
      'rate-limit:email-send-ip:198.51.100.2',
    ]);
  });

  it('ignores the forwarded address when the sender is not trusted', async () => {
    for (let i = 1; i <= RATE_LIMIT; i++) {
      const response = await resend({
        forwardedFor: `198.51.100.${i}`,
        remoteAddress: UNTRUSTED_SENDER,
      });
      expect(response.statusCode).toBe(200);
    }

    const blocked = await resend({
      forwardedFor: '198.51.100.99',
      remoteAddress: UNTRUSTED_SENDER,
    });
    expect(blocked.statusCode).toBe(429);

    expect(await ipKeys()).toEqual([`rate-limit:email-send-ip:${UNTRUSTED_SENDER}`]);
  });

  it('counts the rightmost forwarded address when the header holds several', async () => {
    const response = await resend({ forwardedFor: '1.1.1.1, 2.2.2.2' });
    expect(response.statusCode).toBe(200);

    expect(await ipKeys()).toEqual(['rate-limit:email-send-ip:2.2.2.2']);
  });
});
