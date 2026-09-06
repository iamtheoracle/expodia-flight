import Link from 'next/link';

const navigation = [
  ['Dashboard', '/'],
  ['New booking', '/bookings/new'],
  ['Bookings', '/bookings'],
  ['Passengers', '/passengers'],
  ['Tickets', '/tickets'],
  ['Flight tracking', '/tracking'],
  ['Notifications', '/notifications'],
  ['Audit', '/audit'],
] as const;

export function AppShell({ children, currentPath }: { children: React.ReactNode; currentPath: string }) {
  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">Expodia Flights</div>
        <nav className="nav">
          {navigation.map(([label, href]) => (
            <Link key={href} href={href} aria-current={currentPath === href ? 'page' : undefined}>{label}</Link>
          ))}
        </nav>
      </aside>
      <main className="main">
        <header className="header">
          <div className="headerTitle">Agent workspace</div>
          <div className="status"><span className="statusDot" aria-hidden="true" /> Provider-backed mode</div>
        </header>
        {children}
      </main>
    </div>
  );
}
