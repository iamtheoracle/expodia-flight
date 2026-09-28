import Link from 'next/link';
import { AppShell } from '@/components/app-shell/AppShell';

const workspaces = [
  ['Find flights', '/bookings/new', 'Search connected flight inventory and prepare a booking.'],
  ['Bookings', '/bookings', 'Manage customer journeys and booking records.'],
  ['Passengers', '/passengers', 'Review passenger information attached to authorized bookings.'],
  ['Tickets', '/tickets', 'Review ticket records generated from bookings.'],
  ['Documents', '/documents', 'Manage confirmations, itineraries and travel documents.'],
  ['Flight tracking', '/tracking', 'Follow operational flight and booking status separately.'],
  ['Aviation intelligence', '/aviation', 'Review aviation intelligence available to the operational team.'],
  ['Notifications', '/notifications', 'Review booking, document and operational updates.'],
  ['Audit', '/audit', 'Review authorized operational audit records.'],
];

export default function AgentDashboardPage() {
  return (
    <AppShell currentPath="/agent">
      <section className="publicSection" style={{ paddingTop: 32 }}>
        <div className="publicEyebrow">AGENT WORKSPACE</div>
        <h1>Operations for the journeys you handle.</h1>
        <p>Search, prepare, manage and track customer travel work from one operational workspace.</p>
        <div className="discoveryGrid" style={{ marginTop: 24 }}>
          {workspaces.map(([label, href, description]) => (
            <Link key={href} href={href} className="discoveryCard">
              <span>{label}</span>
              <strong>{description}</strong>
              <small>Open →</small>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
