import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CONTACT_EMAIL } from '@loopra/domain';
import { useApp } from '../../helpers/app.js';

describe('POST /contact', () => {
  const appRef = useApp();
  const VALID_BODY = {
    name: 'Anna Nowak',
    email: 'Anna@Example.com',
    message: 'Hi, I would like to talk about Loopra.',
  };

  const sendMock = () =>
    vi
      .spyOn(appRef.app.mailer.emails, 'send')
      .mockResolvedValue({ data: { id: 'email-id' }, error: null, headers: null });

  const postContact = (body: object, remoteAddress?: string) =>
    appRef.app.inject({ method: 'POST', url: '/contact', body, remoteAddress });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends the message to the contact email with reply-to set to the sender', async () => {
    const send = sendMock();

    const response = await postContact(VALID_BODY);

    expect(response.statusCode).toBe(200);
    expect(Object.keys(response.json())).toEqual(['message']);
    expect(send).toHaveBeenCalledTimes(1);
    const [email] = send.mock.calls[0];
    expect(email.to).toBe(CONTACT_EMAIL);
    expect(email.replyTo).toBe('anna@example.com');
    expect(email.text).toContain('Anna Nowak');
    expect(email.text).toContain('anna@example.com');
    expect(email.text).toContain(VALID_BODY.message);
  });

  it('answers success and sends nothing when the honeypot is filled', async () => {
    const send = sendMock();

    const response = await postContact({ ...VALID_BODY, website: 'https://spam.example' });

    expect(response.statusCode).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it('accepts an empty honeypot', async () => {
    const send = sendMock();

    const response = await postContact({ ...VALID_BODY, website: '' });

    expect(response.statusCode).toBe(200);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['name', { ...VALID_BODY, name: '   ' }, 'REQUIRED'],
    ['name', { ...VALID_BODY, name: 'a'.repeat(101) }, 'NAME_TOO_LONG'],
    ['email', { ...VALID_BODY, email: 'not-an-email' }, 'INVALID_EMAIL'],
    ['message', { ...VALID_BODY, message: '' }, 'REQUIRED'],
    ['message', { ...VALID_BODY, message: 'a'.repeat(5001) }, 'MESSAGE_TOO_LONG'],
  ])('answers 400 with the %s field for %j', async (field, body, message) => {
    const send = sendMock();

    const response = await postContact(body);

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ type: 'INVALID_INPUT', message, field });
    expect(send).not.toHaveBeenCalled();
  });

  it('answers 500 when the mailer fails', async () => {
    vi.spyOn(appRef.app.mailer.emails, 'send').mockResolvedValue({
      data: null,
      error: { name: 'application_error', message: 'boom', statusCode: 500 },
      headers: null,
    });

    const response = await postContact(VALID_BODY, '203.0.113.7');

    expect(response.statusCode).toBe(500);
  });

  it('answers 429 after too many messages from one IP', async () => {
    const send = sendMock();
    const RATE_LIMIT = 5;

    for (let i = 1; i <= RATE_LIMIT; i++) {
      const response = await postContact(VALID_BODY, '203.0.113.9');
      expect(response.statusCode).toBe(200);
    }

    const blocked = await postContact(VALID_BODY, '203.0.113.9');
    expect(blocked.statusCode).toBe(429);
    expect(blocked.json().type).toBe('RATE_LIMIT_EXCEEDED');
    expect(send).toHaveBeenCalledTimes(RATE_LIMIT);

    const otherIp = await postContact(VALID_BODY, '203.0.113.10');
    expect(otherIp.statusCode).toBe(200);
  });

  it('counts honeypot requests toward the rate limit', async () => {
    sendMock();

    for (let i = 1; i <= 5; i++) {
      await postContact({ ...VALID_BODY, website: 'spam' }, '203.0.113.11');
    }

    const blocked = await postContact(VALID_BODY, '203.0.113.11');
    expect(blocked.statusCode).toBe(429);
  });
});
