export type InAppNotificationCategory =
  | 'OPERATIONAL'
  | 'BOOKING'
  | 'DOCUMENT'
  | 'DISCOVERY'
  | 'COMMUNITY'
  | 'SYSTEM';

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  category: InAppNotificationCategory;
  href?: string;
  createdAt: string;
  readAt?: string;
}

const STORAGE_KEY = 'expodia:in-app-notifications';
const MAX_NOTIFICATIONS = 50;

type Listener = (notifications: InAppNotification[]) => void;
const listeners = new Set<Listener>();

function publish(notifications: InAppNotification[]) {
  listeners.forEach((listener) => listener(notifications));
}

function trim(notifications: InAppNotification[]) {
  return notifications.slice(0, MAX_NOTIFICATIONS);
}

export function readLocalNotifications(): InAppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InAppNotification[]) : [];
  } catch {
    return [];
  }
}

export function writeLocalNotifications(notifications: InAppNotification[]): void {
  if (typeof window === 'undefined') return;
  const next = trim(notifications);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  publish(next);
}

export function addLocalNotification(input: Omit<InAppNotification, 'id' | 'createdAt'>): InAppNotification {
  const next: InAppNotification = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  writeLocalNotifications([next, ...readLocalNotifications()]);
  return next;
}

export function markLocalNotificationRead(id: string): void {
  const now = new Date().toISOString();
  writeLocalNotifications(
    readLocalNotifications().map((notification) =>
      notification.id === id ? { ...notification, readAt: notification.readAt ?? now } : notification
    )
  );
}

export function markAllLocalNotificationsRead(): void {
  const now = new Date().toISOString();
  writeLocalNotifications(
    readLocalNotifications().map((notification) => (notification.readAt ? notification : { ...notification, readAt: now }))
  );
}

export function clearLocalNotifications(): void {
  writeLocalNotifications([]);
}

export function unreadNotificationCount(notifications: InAppNotification[]): number {
  return notifications.filter((notification) => !notification.readAt).length;
}

export function subscribeToLocalNotifications(listener: Listener): () => void {
  listeners.add(listener);

  if (typeof window === 'undefined') {
    return () => listeners.delete(listener);
  }

  // Keep other open tabs of the same traveler in sync.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener(readLocalNotifications());
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}
