import { NotificationProviderNotConfiguredError } from './errors';

export interface BrowserPushPayload {
  title: string;
  body: string;
  url?: string;
}

export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendBrowserPush(
  subscriptions: PushSubscriptionRecord[],
  payload: BrowserPushPayload
): Promise<{ delivered: number; expired: string[] }> {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:support@expodia.example';

  if (!publicKey) throw new NotificationProviderNotConfiguredError('NEXT_PUBLIC_VAPID_PUBLIC_KEY');
  if (!privateKey) throw new NotificationProviderNotConfiguredError('VAPID_PRIVATE_KEY');

  const webpush = (await import('web-push')).default;
  webpush.setVapidDetails(subject, publicKey, privateKey);

  const expired: string[] = [];
  let delivered = 0;

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        JSON.stringify(payload)
      );
      delivered += 1;
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      // 404/410 mean the browser dropped the subscription; it can be pruned.
      if (status === 404 || status === 410) {
        expired.push(subscription.endpoint);
        continue;
      }
      throw error;
    }
  }

  return { delivered, expired };
}
