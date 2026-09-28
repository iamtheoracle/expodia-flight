import Link from 'next/link';

const navigation = [
  ['Home / Discover', '/traveler'],
  ['Trips', '/traveler/trips'],
  ['Saved', '/traveler/saved'],
  ['Communities', '/traveler/communities'],
  ['Notifications', '/notifications'],
  ['Profile', '/traveler/profile'],
  ['AI Travel Assistant', '/assistant'],
] as const;

export function TravelerShell({ children, currentPath }: { children: React.ReactNode; currentPath?: string }) {
  return (
    <div className="travelerShell">
      <aside className="travelerShellSidebar" aria-label="Traveler navigation">
        <Link href="/traveler" className="travelerShellBrand">Expodia Traveler</Link>
        <nav className="travelerShellNav">
          {navigation.map(([label, href]) => (
            <Link key={href} href={href} aria-current={currentPath === href ? 'page' : undefined}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="travelerShellMain">
        <header className="travelerShellHeader">
          <div>
            <div className="publicEyebrow">TRAVELER SPACE</div>
            <strong>Your journeys, together</strong>
          </div>
          <Link href="/assistant" className="publicSecondary">Ask Expodia</Link>
        </header>
        {children}
      </main>
    </div>
  );
}
