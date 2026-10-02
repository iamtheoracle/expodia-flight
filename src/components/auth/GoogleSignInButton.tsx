'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export type GoogleSignInRole = 'traveler' | 'professional' | 'auto';

/**
 * Shared "Continue with Google" control.
 *
 * The role is carried through the OAuth round trip so /auth/callback knows
 * whether the returning account still needs a traveler profile provisioned.
 */
export function GoogleSignInButton({
  role = 'auto',
  next,
  label = 'Continue with Google',
  className = 'publicSecondary',
}: {
  role?: GoogleSignInRole;
  next?: string;
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function start() {
    setError('');
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const target = next ?? (role === 'traveler' ? '/traveler' : '/');
    const redirectTo = `${window.location.origin}/auth/callback?role=${role}&next=${encodeURIComponent(target)}`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { prompt: 'select_account' },
      },
    });

    if (oauthError) {
      setError('Google sign-in is not available yet. Please use email and password.');
      setLoading(false);
    }
  }

  return (
    <>
      <button className={className} type="button" onClick={start} disabled={loading}>
        {loading ? 'Opening Google…' : label}
      </button>
      {error && <div className="notice" role="alert">{error}</div>}
    </>
  );
}
