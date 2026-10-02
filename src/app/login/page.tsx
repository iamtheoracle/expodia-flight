'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

function LoginForm() {
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
        <h1 style={{ marginTop: 12 }}>Expodia access</h1>
        <p>This secure area is for authorized Expodia travel professionals. Public travelers can use the traveler sign-in instead.</p>
        <form onSubmit={submit} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
          <button className="primary" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button><GoogleSignInButton role="professional" next={next} /><div className="notice">Professional account registration is invitation-only. Use the private registration link supplied by your Expodia administrator.</div>
          {error && <div className="notice" role="alert">{error}</div>}
        </form>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
