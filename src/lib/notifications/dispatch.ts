import type { NotificationChannel } from './contracts';
import { sendEmailWithSendGrid } from './providers/sendgrid';
import { sendRcsWithGoogleRbm } from './providers/google-rbm';
import { sendBrowserPush } from './providers/web-push';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export interface OutboundNotification {
  channel: NotificationChannel;
  /** Email address, phone number (E.164), or user id for PUSH. */
  recipient: string;
  title?: string;
  subject?: string;
  body: string;
  href?: string;
}

export interface DeliveryOutcome {
  channel: NotificationChannel;
  providerMessageId?: string;
  delivered?: number;
}

export async function dispatchNotification(notification: OutboundNotification): Promise<DeliveryOutcome> {
  switch (notification.channel) {
    case 'EMAIL': {
      const result = await sendEmailWithSendGrid({
        to: notification.recipient,
        subject: notification.subject || notification.title || 'Expodia update',
        text: notification.body,
      });
      return { channel: 'EMAIL', providerMessageId: result.providerMessageId };
    }

    case 'RCS': {
      const result = await sendRcsWithGoogleRbm({
        msisdn: notification.recipient,
        text: notification.body,
      });
      return { channel: 'RCS', providerMessageId: result.providerMessageId };
    }

    case 'PUSH': {
      const admin = createSupabaseAdminClient();
      const { data, error } = await admin
        .from('push_subscriptions')
        .select('endpoint,p256dh,auth')
        .eq('user_id', notification.recipient);

      if (error) throw new Error(`Push subscriptions could not be read (${error.message})`);
      if (!data?.length) return { channel: 'PUSH', delivered: 0 };

      const result = await sendBrowserPush(data, {
        title: notification.title || 'Expodia',
        body: notification.body,
        url: notification.href,
      });

      if (result.expired.length) {
        await admin.from('push_subscriptions').delete().in('endpoint', result.expired);
      }

      return { channel: 'PUSH', delivered: result.delivered };
    }

    default:
      throw new Error(`Channel ${notification.channel} is not supported for outbound delivery`);
  }
}
