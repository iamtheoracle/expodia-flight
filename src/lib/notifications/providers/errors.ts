export class NotificationProviderNotConfiguredError extends Error {
  constructor(missing: string) {
    super(`Notification provider is not configured: ${missing}`);
    this.name = 'NotificationProviderNotConfiguredError';
  }
}
