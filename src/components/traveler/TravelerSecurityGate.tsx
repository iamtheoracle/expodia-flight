'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const DEFAULT_LOCK_MINUTES = 15;
const LOCK_OPTIONS = [5, 10, 15, 30, 60];

function readLockMinutes() {
  if (typeof window === 'undefined') return DEFAULT_LOCK_MINUTES;
  const value = Number(localStorage.getItem('expodia_lock_minutes'));
  return LOCK_OPTIONS.includes(value) ? value : DEFAULT_LOCK_MINUTES;
}

function writeActivity() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('expodia_last_activity', String(Date.now()));
  }
}

export default function TravelerSecurityGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [ready, setReady] = useState(false);
  const [profileLetter, setProfileLetter] = useState('E');
  const [mode, setMode] = useState<'setup' | 'unlock' | null>(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [notice, setNotice] = useState('');
  const [lockMinutes, setLockMinutes] = useState(DEFAULT_LOCK_MINUTES);
  const bypass = pathname === '/traveler/login' || pathname === '/traveler/signup';

  useEffect(() => {
    if (bypass) {
      setReady(true);
      return;
    }
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      if (!data.user) {
        setReady(true);
        return;
      }
      const [{ data: profile }, { data: security }] = await Promise.all([
        supabase.from('traveler_profiles').select('username').eq('user_id', data.user.id).maybeSingle(),
        supabase.from('traveler_security_profiles').select('user_id').eq('user_id', data.user.id).maybeSingle(),
      ]);
      if (!mounted) return;
      setProfileLetter(profile?.username?.slice(0, 1).toUpperCase() || 'E');
      const minutes = readLockMinutes();
      setLockMinutes(minutes);
      const manuallyLocked = localStorage.getItem('expodia_app_locked') === '1';
      const lastActivity = Number(localStorage.getItem('expodia_last_activity') || 0);
      const expired = lastActivity > 0 && Date.now() - lastActivity >= minutes * 60_000;
      if (!security) setMode('setup');
      else if (manuallyLocked || expired) setMode('unlock');
      else writeActivity();
      setReady(true);
    });
    return () => { mounted = false; };
  }, [bypass, supabase]);

  useEffect(() => {
    if (!ready || bypass || mode) return;
    let lastWrite = 0;
    const activity = () => {
      const now = Date.now();
      if (now - lastWrite < 10_000) return;
      lastWrite = now;
      writeActivity();
    };
    const events = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, activity, { passive: true }));
    const timer = window.setInterval(() => {
      const minutes = readLockMinutes();
      setLockMinutes(minutes);
      const lastActivity = Number(localStorage.getItem('expodia_last_activity') || Date.now());
      if (Date.now() - lastActivity >= minutes * 60_000) {
        localStorage.setItem('expodia_app_locked', '1');
        setMode('unlock');
      }
    }, 1000);
    const onStorage = () => setLockMinutes(readLockMinutes());
    const onManualLock = () => {
      localStorage.setItem('expodia_app_locked', '1');
      setMode('unlock');
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('expodia:lock', onManualLock);
    return () => {
      events.forEach(event => window.removeEventListener(event, activity));
      window.clearInterval(timer);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('expodia:lock', onManualLock);
    };
  }, [bypass, mode, ready]);

  async function savePin() {
    if (!/^\d{4}$/.test(pin) || pin !== confirmPin) {
      setNotice('Create and confirm a four-digit PIN.');
      return;
    }
    const { data, error } = await supabase.rpc('set_traveler_security', { p_pin: pin });
    if (error || data !== true) {
      setNotice('Your PIN could not be saved.');
      return;
    }
    localStorage.removeItem('expodia_app_locked');
    writeActivity();
    setMode(null);
    setPin('');
    setConfirmPin('');
    setNotice('');
  }

  async function unlock() {
    if (!/^\d{4}$/.test(pin)) {
      setNotice('Enter your four-digit PIN.');
      return;
    }
    const { data } = await supabase.rpc('verify_traveler_security', { p_pin: pin });
    if (data !== true) {
      setNotice('PIN verification failed.');
      setPin('');
      return;
    }
    localStorage.removeItem('expodia_app_locked');
    writeActivity();
    setMode(null);
    setPin('');
    setNotice('');
  }

  async function signOut() {
    localStorage.removeItem('expodia_app_locked');
    localStorage.removeItem('expodia_last_activity');
    await supabase.auth.signOut();
    router.replace('/access');
  }

  if (!ready) return <main className="travelerApp"><div className="travelerAppLoading">Loading your traveler space…</div></main>;
  if (bypass) return <>{children}</>;

  if (mode) {
    return (
      <main className="travelerApp travelerLocked">
        <section className="travelerLockCard">
          <div className="travelerAvatar">{profileLetter}</div>
          <div className="publicEyebrow">{mode === 'setup' ? 'FIRST-TIME SECURITY' : 'TRAVELER SPACE LOCKED'}</div>
          <h1>{mode === 'setup' ? 'Create your personal PIN' : 'Unlock your traveler space'}</h1>
          <p>
            {mode === 'setup'
              ? 'Your private traveler space is protected by a four-digit PIN. You can change the automatic lock duration from Profile → Security.'
              : 'This traveler space locked after ' + lockMinutes + ' minutes of inactivity. Enter your PIN to continue.'}
          </p>
          {mode === 'setup' ? (
            <>
              <input className="travelerPinInput" inputMode="numeric" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" aria-label="Create PIN" />
              <input className="travelerPinInput" inputMode="numeric" maxLength={4} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" aria-label="Confirm PIN" />
              <button className="publicPrimary" onClick={savePin}>Create PIN</button>
            </>
          ) : (
            <>
              <input className="travelerPinInput" inputMode="numeric" maxLength={4} autoFocus value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" aria-label="PIN" />
              <button className="publicPrimary" onClick={unlock}>Unlock</button>
            </>
          )}
          {notice && <div className="notice" role="alert">{notice}</div>}
          <button className="publicSecondary" onClick={signOut}>Sign out</button>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
