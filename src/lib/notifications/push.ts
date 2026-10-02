'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export type BrowserPushStatus = 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed' | 'error';

const WORKER_PATH = '/sw.js';

export function browserPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

function applicationServerKey(): Uint8Array<ArrayBuffer> | null {
  const value = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!value) return null;

  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

async function workerRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration(WORKER_PATH);
  return existing ?? navigator.serviceWorker.register(WORKER_PATH);
}

export async function currentPushStatus(): Promise<BrowserPushStatus> {
  if (!browserPushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';

  const registration = await navigator.serviceWorker.getRegistration(WORKER_PATH);
  const subscription = await registration?.pushManager.getSubscription();
  return subscription ? 'subscribed' : 'unsubscribed';
}

export async function enableBrowserPush(userId: string): Promise<BrowserPushStatus> {
  if (!browserPushSupported()) return 'unsupported';

  const key = applicationServerKey();
  if (!key) return 'error';

  if ((await Notification.requestPermission()) !== 'granted') return 'denied';

  const registration = await workerRegistration();
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key }));

  const serialized = subscription.toJSON();
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: serialized.keys?.p256dh ?? '',
      auth: serialized.keys?.auth ?? '',
    },
    { onConflict: 'endpoint' }
  );

  return error ? 'error' : 'subscribed';
}

export async function disableBrowserPush(): Promise<BrowserPushStatus> {
  if (!browserPushSupported()) return 'unsupported';

  const registration = await navigator.serviceWorker.getRegistration(WORKER_PATH);
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return 'unsubscribed';

  const supabase = createSupabaseBrowserClient();
  await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint);
  await subscription.unsubscribe();

  return 'unsubscribed';
}
