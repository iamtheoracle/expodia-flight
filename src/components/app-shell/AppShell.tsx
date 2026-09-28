import Link from 'next/link';

const navigation = [
  ['Dashboard', '/agent'], ['Find flights', '/bookings/new'], ['Cart', '/cart'],
  ['Bookings', '/bookings'], ['Passengers', '/passengers'], ['Tickets', '/tickets'],
  ['Documents', '/documents'], ['Flight tracking', '/tracking'], ['Aviation intelligence', '/aviation'],
  ['Notifications', '/notifications'], ['Audit', '/audit'],
] as const;

export function AppShell({ children, currentPath }: { children: React.ReactNode; currentPath: string }) {
  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Agent navigation">
        <div className="brand">Expodia Agent</div>
        <nav className="nav">
          {navigation.map(([label, href]) => (
            <Link key={href} href={href} aria-current={currentPath === href ? 'page' : undefined}>{label}</Link>
          ))}
        </nav>
      </aside>
      <main className="main">
        <header className="header">
          <div className="headerTitle">Agent operations</div>
          <div className="status"><span className="statusDot" aria-hidden="true" /> Booking workspace</div>
        </header>
        {children}
      </main>
    </div>
  );
}
