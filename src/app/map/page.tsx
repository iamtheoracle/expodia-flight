import Link from 'next/link';
import ExpodiaIntelligenceMap from '@/components/ExpodiaIntelligenceMap';

export default function MapPage() {
  return (
    <main className="publicPage expodiaMapPage">
      <header className="publicHeader">
        <Link href="/" className="publicBrand">Expodia Flights</Link>
        <nav className="publicNav">
          <Link href="/explore">Explore</Link>
          <Link href="/aviation-public">Aviation</Link>
          <Link href="/track">Track</Link>
          <Link href="/traveler">My journeys</Link>
          <Link href="/access" className="agentAccess">Agent Access</Link>
        </nav>
      </header>

      <section className="publicSection expodiaMapIntro">
        <div className="publicEyebrow">EXPODIA GEOGRAPHIC INTELLIGENCE</div>
        <h1>The world, understood as a journey.</h1>
        <p>
          Explore airports, routes and journeys on one geographic operating surface.
          As verified sources come online, the same map can expose operational conditions,
          disruptions, weather, destinations and nearby travel services without creating
          separate copies of the underlying truth.
        </p>
      </section>

      <section className="expodiaMapWorkspace">
        <ExpodiaIntelligenceMap height={640} initialLayer="airports" />

        <div className="expodiaMapPrinciples">
          <article><span>01</span><strong>Geography</strong><p>Airports and destinations are reference entities. They are not treated as live operational facts merely because they exist on the map.</p></article>
          <article><span>02</span><strong>Intelligence</strong><p>Operational claims require a source observation, timestamp and verification state before they are presented as current.</p></article>
          <article><span>03</span><strong>Journeys</strong><p>Booked and authorized journeys can become persistent route objects, connecting the map to Track, Trips, Chat and notifications.</p></article>
          <article><span>04</span><strong>Action</strong><p>The map is not the endpoint. An airport, route or disruption can become a research task, travel plan, support action or human-agent workflow.</p></article>
        </div>
      </section>
    </main>
  );
}
