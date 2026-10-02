'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { subscribeToLocalNotifications } from '@/lib/notifications/in-app-store';
import './notifications.css';

export interface Toast {
  id: string;
  title: string;
  body: string;
  href?: string;
}

interface ToastContextValue {
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const TOAST_DURATION_MS = 6000;
const MAX_VISIBLE_TOASTS = 4;

export function useToasts(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToasts must be used inside a ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismissToast = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { ...toast, id }].slice(-MAX_VISIBLE_TOASTS));
      timers.current.set(id, setTimeout(() => dismissToast(id), TOAST_DURATION_MS));
    },
    [dismissToast]
  );

  // Anything landing in the in-app store surfaces as a pop-up automatically.
  useEffect(
    () =>
      subscribeToLocalNotifications((notifications) => {
        const latest = notifications[0];
        if (!latest || latest.readAt) return;
        pushToast({ title: latest.title, body: latest.body, href: latest.href });
      }),
    [pushToast]
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  const value = useMemo(() => ({ pushToast, dismissToast }), [pushToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="notificationToastStack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <article key={toast.id} className="notificationToast">
            <div>
              <strong>{toast.title}</strong>
              <p>{toast.body}</p>
            </div>
            <div className="notificationToastActions">
              {toast.href && <a href={toast.href}>Open</a>}
              <button type="button" onClick={() => dismissToast(toast.id)} aria-label="Dismiss notification">×</button>
            </div>
          </article>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
