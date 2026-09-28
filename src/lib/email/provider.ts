export async function sendTravelEmail(input: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.TRAVEL_EMAIL_FROM;
  if (!apiKey || !from) throw new Error('EMAIL_PROVIDER_NOT_CONFIGURED');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [input.to], subject: input.subject, html: input.html }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`EMAIL_PROVIDER_FAILED: ${response.status}`);
  return { id: body?.id as string | undefined };
}
