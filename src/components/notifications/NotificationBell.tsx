'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  markAllLocalNotificationsRead,
  markLocalNotificationRead,
  readLocalNotifications,
  subscribeToLocalNotifications,
  unreadNotificationCount,
  type InAppNotification,
} from '@/lib/notifications/in-app-store';
import {
  browserPushSupported,
  currentPushStatus,
  disableBrowserPush,
  enableBrowserPush,
  type BrowserPushStatus,
} from '@/lib/notifications/push';
import './notifications.css';

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [pushStatus, setPushStatus] = useState<BrowserPushStatus>('unsupported');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotifications(readLocalNotifications());
    const unsubscribe = subscribeToLocalNotifications(setNotifications);
    if (browserPushSupported()) void currentPushStatus().then(setPushStatus);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const toggleBrowserAlerts = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setPushStatus(pushStatus === 'subscribed' ? await disableBrowserPush() : await enableBrowserPush(user.id));
  }, [pushStatus]);

  function openNotification(notification: InAppNotification) {
    markLocalNotificationRead(notification.id);
    if (notification.href) {
      setOpen(false);
      router.push(notification.href);
    }
  }

  const unread = unreadNotificationCount(notifications);
  const pushSupported = pushStatus !== 'unsupported';

  return (
    <div className="notificationBell" ref={containerRef}>
      <button
        type="button"
        className="notificationBellButton"
        aria-expanded={open}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">🔔</span>
        {unread > 0 && <span className="notificationBellCount">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notificationBellPanel" role="dialog" aria-label="Notifications">
          <header>
            <strong>Notifications</strong>
            {unread > 0 && (
              <button type="button" onClick={() => markAllLocalNotificationsRead()}>Mark all read</button>
            )}
          </header>

          <div className="notificationBellList">
            {notifications.length === 0 && <p className="notificationBellEmpty">No notifications yet.</p>}
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={notification.readAt ? 'notificationBellItem' : 'notificationBellItem unread'}
                onClick={() => openNotification(notification)}
              >
                <span className="notificationBellCategory">{notification.category}</span>
                <strong>{notification.title}</strong>
                <p>{notification.body}</p>
                <small>{new Date(notification.createdAt).toLocaleString()}</small>
              </button>
            ))}
          </div>

          <footer>
            {pushSupported && (
              <button
                type="button"
                onClick={() => void toggleBrowserAlerts()}
                disabled={pushStatus === 'denied'}
              >
                {pushStatus === 'subscribed'
                  ? 'Turn off browser alerts'
                  : pushStatus === 'denied'
                    ? 'Browser alerts blocked in this browser'
                    : 'Enable browser alerts'}
              </button>
            )}
            <Link href="/notifications" onClick={() => setOpen(false)}>Open notification centre</Link>
          </footer>
        </div>
      )}
    </div>
  );
}
