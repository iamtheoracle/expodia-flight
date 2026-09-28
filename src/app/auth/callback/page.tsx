'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function complete() {
      const supabase = createSupabaseBrowserClient();
      const code = params.get('code');
      const requestedNext = params.get('next') || '/traveler';
      const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/traveler';

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (active) setError('This confirmation link could not be completed. Request a new confirmation email and try again.');
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (active) setError('The confirmation link is incomplete or has expired.');
        return;
      }

      // OAuth/email traveler accounts need a profile row before the protected
      // traveler workspace can recognize the account. This is provisioning,
      // not authorization; middleware still authorizes by database role.
      if (user.user_metadata?.access_type === 'traveler') {
        const requestedUsername = String(user.user_metadata?.username ?? '').trim();
        const username = requestedUsername || `traveler_${user.id.replace(/-/g, '').slice(0, 10)}`;
        const { error: profileError } = await supabase.from('traveler_profiles').upsert(
          { user_id: user.id, username },
          { onConflict: 'user_id' }
        );
          if (profileError) {
            if (active) setError('Your account was authenticated, but your traveler profile could not be provisioned.');
            return;
          }
        }

      if (active) router.replace(next);
    }
    void complete();
    return () => { active = false; };
  }, [params, router]);

  return (
    <main className="verificationPage">
      <section className="verificationCard travelerAuthCard">
        <div className="verificationBadge">EXPODIA</div>
        <div className="publicEyebrow" style={{marginTop:18}}>EMAIL CONFIRMATION</div>
        <h1 style={{marginTop:8}}>{error ? 'Confirmation needs attention' : 'Confirming your Expodia account…'}</h1>
        <p>{error || 'Your email is being verified. We will return you to your traveler space as soon as the session is ready.'}</p>
        {error && <button className="publicPrimary" onClick={() => router.replace('/access')}>Return to Expodia</button>}
      </section>
    </main>
  );
}
