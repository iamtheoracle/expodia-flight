import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { dashboardPathForRole, type PlatformRole } from '@/lib/auth/route-access';
import ExpodiaMap from '@/components/ExpodiaMap';

const discoveries=[
  {label:'Aviation intelligence',text:'Follow airline, airport, aircraft and route developments.',href:'/aviation-public'},
  {label:'Flight tracking',text:'Check a flight and follow its operational journey.',href:'/track'},
  {label:'Plan a journey',text:'Bring flights, stays, events, transport and requirements into one plan.',href:'/traveler'}
];

async function resolveHomeRole(): Promise<PlatformRole> {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseConfig();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'anonymous';
  const [{ data: admin }, { data: agent }, { data: traveler }] = await Promise.all([
    supabase.from('company_admins').select('user_id').eq('user_id', user.id).maybeSingle(),
    supabase.from('agents').select('id').eq('id', user.id).maybeSingle(),
    supabase.from('traveler_profiles').select('user_id').eq('user_id', user.id).maybeSingle(),
  ]);
  if (admin) return 'admin';
  if (agent) return 'agent';
  if (traveler) return 'traveler';
  return 'anonymous';
}

export default async function HomePage(){
  const role = await resolveHomeRole();
  if (role !== 'anonymous') redirect(dashboardPathForRole(role));
  return <main className="publicHome">
    <header className="publicHeader">
      <Link href="/" className="publicBrand">Expodia Flights</Link>
      <nav className="publicNav" aria-label="Main navigation">
        <Link href="/explore">Explore</Link><Link href="/marketplace">Marketplace</Link><Link href="/track">Track</Link><Link href="/traveler">Plan</Link>
        <Link href="/assistant">Assistant</Link><Link href="/access" className="agentAccess">Sign in</Link>
      </nav>
    </header>
    <section className="hero">
      <div className="heroCopy">
        <div className="publicEyebrow">FLIGHTS · TRAVEL · JOURNEYS</div>
        <h1>Plan the journey.<br/>Keep it together.</h1>
        <p>Discover what you need, arrange it with Expodia or trusted partners, and keep the journey in one place. You can explore without signing up.</p>
        <div className="heroActions"><Link className="publicPrimary" href="/traveler">Start planning</Link><Link className="publicSecondary" href="/track">Track a flight</Link></div>
      </div>
      <ExpodiaMap className="heroMap" height={430}/>
    </section>
    <section className="publicSection">
      <div className="sectionHeading"><div><div className="publicEyebrow">ONE PLACE</div><h2>Research the trip before you decide how to book it.</h2></div><Link href="/traveler">Open My Plan →</Link></div>
      <div className="discoveryGrid">{discoveries.map(item=><Link className="discoveryCard" href={item.href} key={item.href}><span>{item.label}</span><strong>{item.text}</strong><small>Open →</small></Link>)}</div>
    </section>
    <section className="journeyStrip"><div><div className="publicEyebrow">OPTIONAL TRAVELER SPACE</div><h2>Browse freely. Save when you need to.</h2><p>Create a traveler space only when you want Expodia to recognize you again, retain documents, keep journeys across visits, or connect you with friends and family.</p></div><Link className="publicSecondary" href="/traveler">Open My Plan</Link></section>
    <footer className="publicFooter"><span>Expodia Flights</span><span>Discovery · Planning · Tracking · Journeys</span><Link href="/access">Sign in</Link></footer>
    <Link className="virtualAgentLauncher" href="/assistant" aria-label="Open Expodia Virtual Agent"><span className="agentPulse"/><span>Virtual Agent</span></Link>
  </main>;
}
