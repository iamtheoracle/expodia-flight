'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const TRAVELER_INACTIVITY_MS = 10 * 60 * 1000;
const TRAVELER_LAST_ACTIVITY_KEY = 'expodia_last_activity_at';
const TRAVELER_LOCK_KEY = 'expodia_app_locked';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Profile = { username: string };

export default function TravelerProfilePage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const markActivity = () => {
        if (localStorage.getItem(TRAVELER_LOCK_KEY) !== '1') localStorage.setItem(TRAVELER_LAST_ACTIVITY_KEY, String(Date.now()));
      };
      if (localStorage.getItem(TRAVELER_LOCK_KEY) === '1') { router.replace('/traveler'); return; }
      if (!localStorage.getItem(TRAVELER_LAST_ACTIVITY_KEY)) markActivity();
      const events = ['pointerdown','keydown','touchstart','scroll','input'];
      events.forEach(event => window.addEventListener(event, markActivity, { passive: true }));
      const timer = window.setInterval(() => {
        const last = Number(localStorage.getItem(TRAVELER_LAST_ACTIVITY_KEY) || 0);
        if (last > 0 && Date.now() - last >= TRAVELER_INACTIVITY_MS) {
          localStorage.setItem(TRAVELER_LOCK_KEY, '1');
          localStorage.removeItem(TRAVELER_LAST_ACTIVITY_KEY);
          router.replace('/traveler');
        }
      }, 1000);
      return () => { events.forEach(event => window.removeEventListener(event, markActivity)); window.clearInterval(timer); };
    }
  }, [router]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace('/access'); return; }
      const { data: row } = await supabase.from('traveler_profiles').select('username').eq('user_id', data.user.id).maybeSingle();
      if (mounted) {
        setProfile(row ?? null);
        setEmail(data.user.email ?? '');
      }
    });
    return () => { mounted = false; };
  }, [router, supabase]);

  async function savePin() {
    setError(''); setMessage('');
    if (!/^\d{4}$/.test(pin)) { setError('Your Expodia PIN must contain exactly four digits.'); return; }
    if (pin !== confirmPin) { setError('The PIN entries do not match.'); return; }
    setSaving(true);
    const { data, error: rpcError } = await supabase.rpc('set_traveler_security', { p_pin: pin });
    if (rpcError || data !== true) setError('The PIN could not be saved. Please try again.');
    else { setMessage('Your personal Expodia PIN is active.'); setPin(''); setConfirmPin(''); }
    setSaving(false);
  }

  async function lockApp() {
    localStorage.setItem(TRAVELER_LOCK_KEY, '1');
    localStorage.removeItem(TRAVELER_LAST_ACTIVITY_KEY);
    router.replace('/traveler');
  }

  async function signOut() {
    localStorage.removeItem(TRAVELER_LOCK_KEY);
    localStorage.removeItem(TRAVELER_LAST_ACTIVITY_KEY);
    await supabase.auth.signOut();
    router.replace('/access');
  }

  if (!profile) {
    return <main className="travelerApp"><div className="travelerAppLoading">Loading your traveler space…</div></main>;
  }

  return (
    <main className="travelerApp">
      <header className="travelerAppHeader">
        <Link href="/traveler" className="travelerAppBrand">Expodia</Link>
        <nav className="travelerAppNav" aria-label="Traveler navigation">
          <Link href="/traveler">Home</Link><Link href="/traveler?tab=groups">Groups</Link><Link href="/traveler/inbox">Inbox</Link>
          <span className="travelerNavActive">Profile</span>
        </nav>
      </header>

      <section className="travelerProfilePage">
        <div className="travelerProfileIdentity">
          <div className="travelerAvatar">{profile.username.slice(0, 1).toUpperCase()}</div>
          <div><div className="publicEyebrow">TRAVELER</div><h1>@{profile.username}</h1><p>{email}</p></div>
        </div>

        <div className="travelerProfileGrid">
          <section className="travelerProfileCard">
            <div className="publicEyebrow">ACCOUNT</div>
            <h2>Your traveler space</h2>
            <p>This is your private Expodia account area. Your profile page does not display other traveler profiles.</p>
            <Link className="publicSecondary" href="/traveler">Return to home</Link>
          </section>

          <section className="travelerProfileCard">
            <div className="publicEyebrow">SECURITY</div>
            <h2>Personal PIN</h2>
            <p>Create or change the four-digit PIN used to unlock your traveler space after you lock the app.</p>
            <div className="travelerPinForm">
              <input inputMode="numeric" autoComplete="off" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0,4))} placeholder="New PIN" aria-label="New PIN" />
              <input inputMode="numeric" autoComplete="off" maxLength={4} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0,4))} placeholder="Confirm PIN" aria-label="Confirm PIN" />
              <button className="publicPrimary" onClick={savePin} disabled={saving}>{saving ? 'Saving…' : 'Save PIN'}</button>
            </div>
          </section>

          <section className="travelerProfileCard">
            <div className="publicEyebrow">APP SECURITY</div>
            <h2>Automatic lock</h2>
            <p>Expodia automatically locks this traveler space after 10 minutes without activity. Your four-digit PIN is required to unlock it again.</p>
            <div className="travelerSettingsList"><div><span>Inactivity duration</span><strong>10 minutes</strong></div><div><span>Unlock method</span><strong>4-digit PIN</strong></div></div>
          </section>

          <section className="travelerProfileCard">
            <div className="publicEyebrow">APP CONTROL</div>
            <h2>Lock this space</h2>
            <p>Lock the traveler space without signing out. The next unlock uses your personal PIN.</p>
            <button className="publicSecondary" onClick={lockApp}>Lock Expodia</button>
          </section>

          <section className="travelerProfileCard">
            <div className="publicEyebrow">SETTINGS</div>
            <h2>Account settings</h2>
            <div className="travelerSettingsList">
              <div><span>Email</span><strong>{email}</strong></div>
              <div><span>Username</span><strong>@{profile.username}</strong></div>
              <div><span>Account</span><strong>Traveler</strong></div>
            </div>
          </section>
        </div>

        {message && <div className="notice" role="status">{message}</div>}
        {error && <div className="notice" role="alert">{error}</div>}
        <button className="travelerDangerAction" onClick={signOut}>Sign out</button>
      </section>
    </main>
  );
}
