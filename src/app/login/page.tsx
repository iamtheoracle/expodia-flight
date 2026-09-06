'use client';

import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError('Sign-in failed. Check the agent credentials or contact an administrator.');
      setLoading(false);
      return;
    }
    window.location.assign(next.startsWith('/') ? next : '/');
  }

  return (
    <main className="verificationPage">
      <section className="verificationCard">
        <div className="verificationBadge">EXPODIA FLIGHTS</div>
        <h1 style={{ marginTop: 12 }}>Agent sign in</h1>
        <p>Use an authorized Expodia agent account. Booking operations require authenticated access.</p>
        <form onSubmit={submit} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
          <button className="primary" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
          {error && <div className="notice" role="alert">{error}</div>}
        </form>
      </section>
    </main>
  );
}
