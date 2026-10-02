'use client';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

export default function TravelerSignupPage() { const router=useRouter();
  const [error, setError] = useState(''); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage(''); setLoading(true);
    const form = new FormData(event.currentTarget); const username=String(form.get('username')??'').trim(); const email=String(form.get('email')??'').trim(); const password=String(form.get('password')??'');
    if (!/^[A-Za-z0-9_]{3,30}$/.test(username)) { setError('Choose a username with 3–30 letters, numbers, or underscores.'); setLoading(false); return; }
    const supabase=createSupabaseBrowserClient(); const {data,error:signUpError}=await supabase.auth.signUp({email,password,options:{data:{username,access_type:'traveler'},emailRedirectTo:`${window.location.origin}/auth/callback?next=/traveler`}});
    if(signUpError){setError(signUpError.message);setLoading(false);return;}
    if(data.user&&data.session){
      const {error:profileError}=await supabase.from('traveler_profiles').insert({user_id:data.user.id,username});
      if(profileError){await supabase.auth.signOut();setError(profileError.code==='23505'?'That username is already in use.':profileError.message);setLoading(false);return;}
      router.push('/traveler'); return;
    }
    setMessage('Your account has been created. Check your email if confirmation is required, then sign in to finish setting up your traveler space.'); setLoading(false);
  }
  return <main className="verificationPage"><section className="verificationCard travelerAuthCard"><div className="verificationBadge">EXPODIA</div><h1 style={{marginTop:12}}>Create your traveler space</h1><p>Choose a username so Expodia can recognize your saved journeys, documents and travel plans when you return.</p><form onSubmit={submit} style={{display:'grid',gap:16,marginTop:24}}><label>Username<input name="username" autoComplete="username" placeholder="your_username" required /></label><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label><button className="publicPrimary" type="submit" disabled={loading}>{loading?'Creating…':'Create traveler space'}</button><GoogleSignInButton role="traveler" next="/traveler" />{error&&<div className="notice" role="alert">{error}</div>}{message&&<div className="notice" role="status">{message}</div>}</form><p className="travelerAuthLinks"><Link href="/traveler/login">Already have a traveler space?</Link><Link href="/traveler">Continue without signing in</Link></p></section></main>;
}
