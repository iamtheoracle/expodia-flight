'use client';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

export default function TravelerLoginPage() { const router=useRouter();
  const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setError('');setLoading(true);const form=new FormData(event.currentTarget);const email=String(form.get('email')??'').trim();const password=String(form.get('password')??'');const supabase=createSupabaseBrowserClient();const {error:signInError}=await supabase.auth.signInWithPassword({email,password});if(signInError){setError('Sign-in failed. Check your traveler credentials.');setLoading(false);return;}router.push('/traveler');}
  return <main className="verificationPage"><section className="verificationCard travelerAuthCard"><div className="verificationBadge">EXPODIA</div><h1 style={{marginTop:12}}>Open your traveler space</h1><p>Sign in only when you need saved journeys, documents, group travel or other profile-based features.</p><form onSubmit={submit} style={{display:'grid',gap:16,marginTop:24}}><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button className="publicPrimary" type="submit" disabled={loading}>{loading?'Signing in…':'Sign in'}</button><GoogleSignInButton role="traveler" next="/traveler" />{error&&<div className="notice" role="alert">{error}</div>}</form><p className="travelerAuthLinks"><Link href="/traveler/signup">Create a traveler space</Link><Link href="/traveler">Continue without signing in</Link></p></section></main>;
}
