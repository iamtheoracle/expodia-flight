import type { NotificationEvent } from './contracts';

export function assertNotificationSendable(event: NotificationEvent): void {
  if (!event.idempotencyKey || !event.eventKey || !event.channel || !event.recipient) {
    throw new Error('Notification requires an event, idempotency key, channel, and recipient');
  }
  if (event.status === 'SENT' && !event.providerMessageId) {
    throw new Error('A sent notification requires provider delivery confirmation');
  }
}

export function isDuplicateNotification(existingIdempotencyKeys: Set<string>, event: NotificationEvent): boolean {
  return existingIdempotencyKeys.has(event.idempotencyKey);
}
