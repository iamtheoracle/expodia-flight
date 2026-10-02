export type NotificationChannel = 'EMAIL' | 'SMS' | 'RCS' | 'WHATSAPP' | 'PUSH' | 'IN_APP';
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
