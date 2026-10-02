import { NotificationProviderNotConfiguredError } from './errors';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const SENDGRID_ENDPOINT = 'https://api.sendgrid.com/v3/mail/send';

export async function sendEmailWithSendGrid(message: EmailMessage): Promise<{ providerMessageId?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.NOTIFICATION_EMAIL_FROM;

  if (!apiKey) throw new NotificationProviderNotConfiguredError('SENDGRID_API_KEY');
  if (!from) throw new NotificationProviderNotConfiguredError('NOTIFICATION_EMAIL_FROM');

  const response = await fetch(SENDGRID_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: message.to }] }],
      from: { email: from },
      subject: message.subject,
      content: [
        { type: 'text/plain', value: message.text },
        ...(message.html ? [{ type: 'text/html', value: message.html }] : []),
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`SendGrid rejected the email (${response.status})`);
  }

  return { providerMessageId: response.headers.get('x-message-id') ?? undefined };
}
