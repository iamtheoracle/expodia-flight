'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AccessPage() {
  const router = useRouter();
  const [signUpMode, setSignUpMode] = useState(false);
  const [professionalMode, setProfessionalMode] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [securityPin, setSecurityPin] = useState('');
  const [sessionDuration, setSessionDuration] = useState('43200');
  const [agentPinRequired, setAgentPinRequired] = useState(false);
  const [agentSecuritySetup, setAgentSecuritySetup] = useState(false);
  const [agentPin, setAgentPin] = useState('');

  async function continueWithGoogle() {
    setError(''); setMessage(''); setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/traveler`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    });
    if (oauthError) {
      setError('Google sign-in is not available yet. Please use email and password.');
      setLoading(false);
    }
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');
    const supabase = createSupabaseBrowserClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !data.user) {
      setError('Sign-in failed. Check your email and password and try again.');
      setLoading(false);
      return;
    }

    const [{ data: agent }, { data: traveler }] = await Promise.all([
      supabase.from('agents').select('id').eq('id', data.user.id).maybeSingle(),
      supabase.from('traveler_profiles').select('user_id').eq('user_id', data.user.id).maybeSingle(),
    ]);

    if (agent) {
      const { data: security } = await supabase
        .from('agent_security_profiles')
        .select('user_id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (security) {
        setAgentPinRequired(true);
        setLoading(false);
        return;
      }

      setAgentSecuritySetup(true);
      setLoading(false);
      return;
      return;
    }

    if (traveler) {
      router.replace('/traveler');
      return;
    }

    await supabase.auth.signOut();
    setError('This account is not assigned to an Expodia access type yet. Contact Expodia support.');
    setLoading(false);
  }

  async function saveInitialAgentSecurity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    if (!/^\d{4}$/.test(securityPin)) {
      setError('Create a four-digit security PIN.');
      setLoading(false);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const { data: saved } = await supabase.rpc('set_agent_security', {
      p_pin: securityPin,
      p_session_duration_minutes: Number(sessionDuration),
    });
    if (saved !== true) {
      await supabase.auth.signOut();
      setAgentSecuritySetup(false);
      setError('Security setup could not be completed. Please sign in again.');
      setLoading(false);
      return;
    }
    router.replace('/agent');
  }

  async function verifyAgentPin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    if (!/^\d{4}$/.test(agentPin)) {
      setError('Enter your four-digit security PIN.');
      setLoading(false);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const { data: valid } = await supabase.rpc('verify_agent_security', { p_pin: agentPin });
    if (valid !== true) {
      await supabase.auth.signOut();
      setAgentPinRequired(false);
      setAgentPin('');
      setError('Security PIN verification failed. Please sign in again.');
      setLoading(false);
      return;
    }
    router.replace('/agent');
  }

  async function signUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(''); setMessage('');

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');
    const username = String(form.get('username') ?? '').trim();

    if (!/^[A-Za-z0-9_]{3,30}$/.test(username)) {
      setError('Choose a username with 3–30 letters, numbers, or underscores.');
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error: signupError } = await supabase.auth.signUp({ email, password, options: { data: { username, access_type: 'traveler' }, emailRedirectTo: `${window.location.origin}/auth/callback?next=/traveler` } });

    if (signupError || !data.user) {
      setError(signupError?.message || 'We could not create your traveler account.');
      setLoading(false);
      return;
    }

    if (!data.session) {
      setMessage('Your traveler account has been created. Check your email if confirmation is required, then sign in.');
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from('traveler_profiles').upsert({
      user_id: data.user.id,
      username,
    }, { onConflict: 'user_id' });

    if (profileError) {
      await supabase.auth.signOut();
      setError(profileError.code === '23505' ? 'That username is already in use.' : 'We could not complete your traveler profile.');
      setLoading(false);
      return;
    }

    router.replace('/traveler');
  }

  async function professionalSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(''); setMessage(''); setLoading(true);

    const form = new FormData(event.currentTarget);
    const fullName = String(form.get('fullName') ?? '').trim();
    const email = String(form.get('professionalEmail') ?? '').trim().toLowerCase();
    const shortMessage = String(form.get('shortMessage') ?? '').trim();
    const code = String(form.get('referralCode') ?? '').trim();

    if (!/^[0-9]{6}$/.test(code)) {
      setError('Enter the six-digit Expodia referral code supplied with your invitation.');
      setLoading(false);
      return;
    }

    if (!fullName || !email || !shortMessage) {
      setError('Complete your full name, email and short message.');
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data: valid, error: codeError } = await supabase.rpc('verify_agent_registration_code', { p_code: code, p_email: email });

    if (codeError || valid !== true) {
      setError('That referral code is invalid, expired, revoked, or has already been used.');
      setLoading(false);
      return;
    }

    const password = String(form.get('professionalPassword') ?? '');
    if (!/^\d{4}$/.test(securityPin)) {
      setError('Create a four-digit security PIN.');
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError('Create a password of at least 8 characters.');
      setLoading(false);
      return;
    }

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, access_type: 'professional' }, emailRedirectTo: `${window.location.origin}/auth/callback?next=/access` },
    });

    if (signupError || !data.user) {
      setError(signupError?.message || 'We could not create the professional account.');
      setLoading(false);
      return;
    }

    if (!data.session) {
      setMessage('Your professional account has been created. Check your email if confirmation is required, then sign in.');
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from('agents').insert({
      id: data.user.id,
      display_name: fullName,
      email,
    });

    if (profileError) {
      await supabase.auth.signOut();
      setError('We could not complete the professional account. Contact an Expodia administrator.');
      setLoading(false);
      return;
    }

    await supabase.rpc('record_agent_application', { p_short_message: shortMessage });

    const { data: securitySaved } = await supabase.rpc('set_agent_security', {
      p_pin: securityPin,
      p_session_duration_minutes: Number(sessionDuration),
    });
    if (securitySaved !== true) {
      await supabase.auth.signOut();
      setError('The professional account was created but its security setup could not be completed. Contact an administrator.');
      setLoading(false);
      return;
    }

    router.replace('/agent');
  }

  return (
    <main className="verificationPage">
      <section className="verificationCard travelerAuthCard">
        <div className="verificationBadge">EXPODIA</div>
        <h1 style={{ marginTop: 12 }}>Access</h1>
        <p>Sign in to continue. Expodia automatically recognizes whether your account is a traveler or an authorized professional.</p>

        {!signUpMode ? (
          agentSecuritySetup ? (
            <form onSubmit={saveInitialAgentSecurity} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
              <p><strong>Professional security setup.</strong> Your professional account needs a four-digit security PIN before you can enter the workspace.</p>
              <label>4-digit security PIN<input value={securityPin} onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" autoComplete="off" maxLength={4} placeholder="••••" required /></label>
              <label>Professional session period<select value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)}><option value="1440">24 hours</option><option value="10080">7 days</option><option value="43200">30 days</option><option value="129600">90 days</option></select></label>
              <button className="primary" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save security settings'}</button>
            </form>
          ) : agentPinRequired ? (
            <form onSubmit={verifyAgentPin} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
              <p><strong>Professional security check.</strong> Enter your four-digit security PIN to open the Expodia professional workspace.</p>
              <label>Security PIN<input value={agentPin} onChange={(e) => setAgentPin(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" autoComplete="one-time-code" maxLength={4} placeholder="••••" required /></label>
              <button className="primary" type="submit" disabled={loading}>{loading ? 'Verifying…' : 'Continue'}</button>
            </form>
          ) : (
          <form onSubmit={signIn} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
            <label>Email<input name="email" type="email" autoComplete="email" required /></label>
            <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
            <button className="primary" type="submit" disabled={loading}>{loading ? 'Checking…' : 'Sign in'}</button>
            <button className="publicSecondary" type="button" onClick={continueWithGoogle} disabled={loading}>Continue with Google</button>
            <button className="publicSecondary" type="button" onClick={() => { setSignUpMode(true); setError(''); setMessage(''); }}>Sign up</button>
            <div className="travelerAuthLinks">
              <Link href="/traveler">Continue without an account</Link>
            </div>
          </form>
          )
        ) : (
          <>
            {!professionalMode ? (
              <form onSubmit={signUp} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
                <p><strong>Create a traveler account.</strong> Sign-up is for travelers. Professional worker registration requires an Expodia referral code.</p>
                <label>Full name<input name="fullName" autoComplete="name" required /></label>
                <label>Username<input name="username" autoComplete="username" placeholder="your_username" required /></label>
                <label>Email<input name="email" type="email" autoComplete="email" required /></label>
                <label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
                <button className="primary" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create traveler account'}</button>
                <button className="publicSecondary" type="button" onClick={continueWithGoogle} disabled={loading}>Continue with Google</button>
                <button className="publicSecondary" type="button" onClick={() => setProfessionalMode(true)}>I have an Expodia referral code</button>
                <button className="publicSecondary" type="button" onClick={() => { setSignUpMode(false); setError(''); setMessage(''); }}>Back to sign in</button>
              </form>
            ) : (
              <form onSubmit={professionalSignup} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
                <p><strong>Expodia professional invitation.</strong> This route is invitation-only. A valid six-digit referral code identifies an authorized professional applicant.</p>
                <label>Referral code<input name="referralCode" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" placeholder="000000" required /></label>
                <label>Full name<input name="fullName" autoComplete="name" required /></label>
                <label>Email<input name="professionalEmail" type="email" autoComplete="email" required /></label>
                <label>Short message<textarea name="shortMessage" rows={4} maxLength={500} placeholder="Briefly tell Expodia about your experience." required /></label>
                <label>Password<input name="professionalPassword" type="password" autoComplete="new-password" minLength={8} required /></label>
                <label>4-digit security PIN<input value={securityPin} onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" autoComplete="off" maxLength={4} placeholder="••••" required /></label>
                <label>Professional session period<select value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)}><option value="1440">24 hours</option><option value="10080">7 days</option><option value="43200">30 days</option><option value="129600">90 days</option></select></label>
                <button className="primary" type="submit" disabled={loading}>{loading ? 'Verifying invitation…' : 'Create professional account'}</button>
                <button className="publicSecondary" type="button" onClick={() => setProfessionalMode(false)}>Back to traveler sign up</button>
              </form>
            )}
          </>
        )}

        {error && <div className="notice" role="alert" style={{ marginTop: 16 }}>{error}</div>}
        {message && <div className="notice" role="status" style={{ marginTop: 16 }}>{message}</div>}
      </section>
    </main>
  );
}
