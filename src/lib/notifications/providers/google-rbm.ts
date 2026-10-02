import crypto from 'node:crypto';
import { NotificationProviderNotConfiguredError } from './errors';

interface RbmServiceAccount {
  client_email: string;
  private_key: string;
}

const RBM_SCOPE = 'https://www.googleapis.com/auth/rcsbusinessmessaging';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const RBM_ENDPOINT = 'https://rcsbusinessmessaging.googleapis.com/v1/phones';

function base64url(value: string): string {
  return Buffer.from(value).toString('base64url');
}

/** Mints a short-lived RBM access token from the agent's service account. */
async function fetchAccessToken(serviceAccount: RbmServiceAccount): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: RBM_SCOPE,
      aud: TOKEN_ENDPOINT,
      iat: issuedAt,
      exp: issuedAt + 3600,
    })
  );

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const signature = signer.sign(serviceAccount.private_key).toString('base64url');
  const assertion = `${header}.${claims}.${signature}`;

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) throw new Error(`Google RBM authentication failed (${response.status})`);

  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) throw new Error('Google RBM authentication returned no access token');
  return payload.access_token;
}

export async function sendRcsWithGoogleRbm(message: { msisdn: string; text: string }): Promise<{ providerMessageId?: string }> {
  const agentId = process.env.GOOGLE_RBM_AGENT_ID;
  const rawServiceAccount = process.env.GOOGLE_RBM_SERVICE_ACCOUNT_JSON;

  if (!agentId) throw new NotificationProviderNotConfiguredError('GOOGLE_RBM_AGENT_ID');
  if (!rawServiceAccount) throw new NotificationProviderNotConfiguredError('GOOGLE_RBM_SERVICE_ACCOUNT_JSON');

  let serviceAccount: RbmServiceAccount;
  try {
    serviceAccount = JSON.parse(rawServiceAccount) as RbmServiceAccount;
  } catch {
    throw new Error('GOOGLE_RBM_SERVICE_ACCOUNT_JSON is not valid JSON');
  }

  const accessToken = await fetchAccessToken(serviceAccount);
  const messageId = crypto.randomUUID();
  const msisdn = message.msisdn.replace(/[^\d+]/g, '');

  const response = await fetch(
    `${RBM_ENDPOINT}/${encodeURIComponent(msisdn)}/agentMessages?messageId=${messageId}&agentId=${encodeURIComponent(agentId)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contentMessage: { text: message.text } }),
    }
  );

  if (!response.ok) throw new Error(`Google RBM rejected the RCS message (${response.status})`);

  return { providerMessageId: messageId };
}
