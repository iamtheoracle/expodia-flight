import Link from 'next/link';
import ExpodiaIntelligenceMap from '@/components/ExpodiaIntelligenceMap';

const discoveries=[
  {label:'Aviation intelligence',text:'Follow airline, airport, aircraft and route developments.',href:'/aviation-public'},
  {label:'Flight tracking',text:'Check a flight and follow its operational journey.',href:'/track'},
  {label:'Plan a journey',text:'Bring flights, stays, events, transport and requirements into one plan.',href:'/traveler'}
];

export default function HomePage(){ return <main className="publicHome">
  <header className="publicHeader">
    <Link href="/" className="publicBrand">Expodia Flights</Link>
    <nav className="publicNav" aria-label="Main navigation">
      <Link href="/explore">Explore</Link><Link href="/map">Map</Link><Link href="/marketplace">Marketplace</Link><Link href="/track">Track</Link><Link href="/traveler">Plan</Link>
      <Link href="/assistant">Assistant</Link><Link href="/access" className="agentAccess">Sign in</Link>
    </nav>
  </header>
  <section className="hero">
    <div className="heroCopy">
      <div className="publicEyebrow">FLIGHTS · TRAVEL · JOURNEYS</div>
      <h1>Plan the journey.<br/>Keep it together.</h1>
      <p>Discover what you need, arrange it with Expodia or trusted partners, and keep the journey in one place. You can explore without signing up.</p>
      <div className="heroActions"><Link className="publicPrimary" href="/traveler">Start planning</Link><Link className="publicSecondary" href="/map">Open intelligence map</Link></div>
    </div>
    <ExpodiaIntelligenceMap className="heroMap" height={430} showControls={false}/>
  </section>
  <section className="publicSection">
    <div className="sectionHeading"><div><div className="publicEyebrow">ONE PLACE</div><h2>Research the trip before you decide how to book it.</h2></div><Link href="/traveler">Open My Plan →</Link></div>
    <div className="discoveryGrid">{discoveries.map(item=><Link className="discoveryCard" href={item.href} key={item.href}><span>{item.label}</span><strong>{item.text}</strong><small>Open →</small></Link>)}</div>
  </section>
  <section className="journeyStrip"><div><div className="publicEyebrow">OPTIONAL TRAVELER SPACE</div><h2>Browse freely. Save when you need to.</h2><p>Create a traveler space only when you want Expodia to recognize you again, retain documents, keep journeys across visits, or connect you with friends and family.</p></div><Link className="publicSecondary" href="/traveler">Open My Plan</Link></section>
  <footer className="publicFooter"><span>Expodia Flights</span><span>Discovery · Planning · Tracking · Journeys · Map</span><Link href="/access">Sign in</Link></footer>
  <Link className="virtualAgentLauncher" href="/assistant" aria-label="Open Expodia Virtual Agent"><span className="agentPulse"/><span>Virtual Agent</span></Link>
</main>; }