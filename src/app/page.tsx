import Link from 'next/link';
import { AppShell } from '@/components/app-shell/AppShell';

const metrics = [
  ['Confirmed bookings', '0'],
  ['Tickets pending', '0'],
  ['Active flights', '0'],
  ['Provider alerts', '0'],
];

export default function HomePage() {
  return (
    <AppShell currentPath="/">
      <section className="content">
        <div className="pageIntro">
          <div>
            <h1>Agent workspace</h1>
            <p className="subtitle">Search live provider inventory, confirm the fare, and let connected systems execute only confirmed operations.</p>
          </div>
          <Link className="primary" href="/bookings/new">New booking</Link>
        </div>

        <div className="grid" aria-label="Operational metrics">
          {metrics.map(([label, value]) => (
            <div className="card" key={label}>
              <div className="metricLabel">{label}</div>
              <div className="metricValue">{value}</div>
            </div>
          ))}
        </div>

        <div className="panel card">
          <div className="panelHeader"><h2 className="panelTitle">Recent activity</h2></div>
          <div className="empty">No production activity yet. Searches, bookings, tickets, tracking events, notifications, and audit events appear here only after they actually occur.</div>
        </div>

        <div className="notice" role="status">
          No approved flight-ticket provider is configured. Production inventory, pricing, booking, ticketing, and operational status remain disabled until a real provider is connected.
        </div>
      </section>
    </AppShell>
  );
}
