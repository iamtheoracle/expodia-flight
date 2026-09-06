export type NotificationChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'SUPPRESSED';

export interface NotificationEvent {
  idempotencyKey: string;
  eventKey: string;
  bookingId?: string;
  passengerId?: string;
  channel: NotificationChannel;
  recipient: string;
  status: NotificationStatus;
  providerMessageId?: string;
}
