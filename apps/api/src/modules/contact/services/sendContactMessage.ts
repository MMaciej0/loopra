import { Resend } from 'resend';
import { CONTACT_EMAIL, type ContactMessageBody } from '@loopra/domain';

export const sendContactMessage = async (
  { name, email, message, website }: ContactMessageBody,
  resend: Resend,
) => {
  if (website) {
    return;
  }

  const { error } = await resend.emails.send({
    from: 'Loopra <noreply@loopra.cc>',
    to: CONTACT_EMAIL,
    replyTo: email,
    subject: `Loopra contact form: ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });

  if (error) {
    throw new Error(`Contact message not sent: ${error.message}`);
  }
};
