import Link from 'next/link';

const navigation = [
  ['Overview', '/admin'],
  ['Agent access', '/admin#agent-access'],
  ['Partners', '/admin#partners'],
  ['Onboarding', '/admin#onboarding'],
  ['Referral codes', '/admin#referrals'],
  ['Audit & control', '/audit'],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Management navigation">
        <div className="brand">Expodia Management</div>
        <nav className="nav">
          {navigation.map(([label, href]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
      </aside>
      <main className="main">
        <header className="header">
          <div className="headerTitle">Management & control</div>
          <div className="status"><span className="statusDot" aria-hidden="true" /> Authorized management session</div>
        </header>
        {children}
      </main>
    </div>
  );
}
